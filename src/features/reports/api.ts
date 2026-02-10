import { db, auth } from '@/lib/firebase/client';
import {
    collection, addDoc, updateDoc, doc,
    query, where, orderBy, getDocs,
    serverTimestamp, runTransaction, getDoc
} from 'firebase/firestore';
import { Report, ReportReason, EnforcementType, ModerationLog } from '@/features/admin/types';
import { UserProfile } from '@/features/gamification/types';
import { addAdminNote } from '@/features/admin/api';

// --- REPORTING ---

export interface CreateReportInput {
    targetType: 'brewspot' | 'review' | 'photo' | 'user'
    targetId: string
    reason: ReportReason
    description?: string
}

export async function createReport(input: CreateReportInput): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in to report");

    // Check for duplicate report by this user for this target
    const q = query(
        collection(db, 'reports'),
        where('reportedBy', '==', user.uid),
        where('targetId', '==', input.targetId),
        where('targetType', '==', input.targetType)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
        throw new Error("You have already reported this content.");
    }

    const reportData: Omit<Report, 'id'> = {
        ...input,
        reportedBy: user.uid,
        status: 'open',
        createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'reports'), reportData);
    return docRef.id;
}

export async function getReports(status: 'open' | 'reviewed' | 'dismissed' = 'open'): Promise<Report[]> {
    const q = query(
        collection(db, 'reports'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));
}

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed', adminNote?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    await updateDoc(doc(db, 'reports', reportId), {
        status,
        updatedAt: new Date().toISOString()
    });

    // Log action
    await logModerationAction({
        actionType: 'resolve_report',
        targetType: 'report',
        targetId: reportId,
        adminId: user.uid,
        reason: `Report ${status}. ${adminNote || ''}`
    });
}

// --- ENFORCEMENT & LOGGING ---

export async function logModerationAction(log: Omit<ModerationLog, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(db, 'moderation_logs'), {
        ...log,
        createdAt: new Date().toISOString()
    });
}

export async function enforceUserAction(userId: string, action: EnforcementType, reason: string, durationHours?: number): Promise<void> {
    const admin = auth.currentUser;
    if (!admin) throw new Error("Unauthorized");

    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");

        const userData = userDoc.data() as UserProfile;

        // Calculate new trust/status based on action
        let updates: Partial<UserProfile> = { updatedAt: new Date().toISOString() };
        let suspensionUntil = null;

        if (action === 'warning') {
            updates.accountStatus = 'warned';
            // Decrement trust level? Need to check current.
            const newTrust = Math.max(0, (userData.trustLevel || 1) - 1);
            updates.trustLevel = newTrust;
        } else if (action === 'suspension') {
            updates.accountStatus = 'suspended';
            updates.isContributor = false; // Revoke contributor
            updates.trustLevel = 0; // Reset trust

            if (durationHours) {
                const d = new Date();
                d.setHours(d.getHours() + durationHours);
                suspensionUntil = d.toISOString();
            }
            updates.suspensionUntil = suspensionUntil;
        } else if (action === 'ban') {
            updates.accountStatus = 'banned';
            updates.isContributor = false;
            updates.trustLevel = 0;
            updates.suspensionUntil = null; // Indefinite
        }

        t.update(userRef, updates);

        // Log to admins note as well for redundancy in User Detail View
        // (We can't await inside transaction easily for external collection if not using t, but firestore allows concurrent writes)
    });

    // Log official moderation action (Audit)
    await logModerationAction({
        actionType: 'enforce_user',
        targetType: 'user',
        targetId: userId,
        adminId: admin.uid,
        reason: `${action.toUpperCase()}: ${reason}`,
        metadata: { durationHours }
    });

    // Add note for UI
    await addAdminNote(userId, 'user', `Enforcement Action: ${action.toUpperCase()}. Reason: ${reason}`);
}

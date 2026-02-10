
import { db, auth } from '@/lib/firebase/client';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc, serverTimestamp, limit, getCountFromServer } from 'firebase/firestore';
import { AdminBrewSpot } from './types';

// Check if user has admin role
export async function checkIsAdmin(uid: string): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) return false;
        const data = userDoc.data();
        return data.role === 'admin';
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Get all pending brewspots
export async function getPendingBrewSpots(): Promise<AdminBrewSpot[]> {
    const spotsRef = collection(db, 'brewspots');
    // Note: This query requires an index on status + createdAt
    const q = query(
        spotsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        approvedAt: doc.data().approvedAt?.toDate?.().toISOString(),
        rejectedAt: doc.data().rejectedAt?.toDate?.().toISOString(),
    } as unknown as AdminBrewSpot));
}

// Get brewspot details by ID (admin view)
export async function getAdminBrewSpotById(id: string): Promise<AdminBrewSpot> {
    const docRef = doc(db, 'brewspots', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        throw new Error('BrewSpot not found');
    }

    const data = snap.data();
    return {
        id: snap.id,
        ...data,
        created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as unknown as AdminBrewSpot;
}

// Approve a brewspot
export async function approveBrewSpot(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const spotRef = doc(db, 'brewspots', id);
    await updateDoc(spotRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid
    });
}

// Reject a brewspot
export async function rejectBrewSpot(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const spotRef = doc(db, 'brewspots', id);
    await updateDoc(spotRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid
    });
}

// Global Settings and Notes
import { addDoc, setDoc } from 'firebase/firestore';
import { GlobalSettings, AdminNote } from './types';

// Global Settings (Singleton document 'default' in 'system_settings' collection)
const SETTINGS_COLLECTION = 'system_settings';
const SETTINGS_DOC = 'global';

export async function getGlobalSettings(): Promise<GlobalSettings> {
    const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        return snap.data() as GlobalSettings;
    } else {
        // Return defaults if not set
        return { enableAutoApproval: true };
    }
}

export async function updateGlobalSettings(settings: Partial<GlobalSettings>): Promise<void> {
    const user = auth.currentUser;
    // In real app, verify admin claim here
    if (!user) throw new Error("Unauthorized");

    const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
    await setDoc(ref, settings, { merge: true });
}

// Admin Notes
export async function addAdminNote(targetId: string, targetType: 'user' | 'review' | 'brewspot', content: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const note: Omit<AdminNote, 'id'> = {
        targetId,
        targetType,
        content,
        authorId: user.uid,
        authorName: user.displayName || 'Admin',
        createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'admin_notes'), note);
    return docRef.id;
}

export async function getAdminNotes(targetId: string): Promise<AdminNote[]> {
    const q = query(
        collection(db, 'admin_notes'),
        where('targetId', '==', targetId),
        orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNote));
}

// User Management
import { UserProfile } from '@/features/gamification/types';

export async function getAllUsers(limitCount: number = 50): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    } as UserProfile));
}

export async function overrideContributorStatus(userId: string, isContributor: boolean, reason?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        isContributor: isContributor,
        // Optional: We could track who overrode it in the user doc, but we'll use Admin Notes for audit
    });

    if (reason) {
        await addAdminNote(userId, 'user', `Contributor status changed to ${isContributor}. Reason: ${reason}`);
    }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin', reason?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    // Prevent self-demotion if not handled carefully, but for now we trust the admin UI logic

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        role: role
    });

    if (reason) {
        await addAdminNote(userId, 'user', `Role changed to ${role}. Reason: ${reason}`);
    }
}

import { GlobalXPLog } from '@/features/gamification/types';

export async function getXPLogsForUser(userId: string, limitCount: number = 20): Promise<GlobalXPLog[]> {
    const q = query(
        collection(db, 'xp_logs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as GlobalXPLog));
}

export async function getDashboardStats() {
    try {
        const spotsRef = collection(db, 'brewspots');
        const reportsRef = collection(db, 'reports');
        const usersRef = collection(db, 'users');

        const pendingQuery = query(spotsRef, where('status', '==', 'pending'));
        const openReportsQuery = query(reportsRef, where('status', '==', 'open'));
        const suspendedQuery = query(usersRef, where('accountStatus', '==', 'suspended'));
        const bannedQuery = query(usersRef, where('accountStatus', '==', 'banned'));

        const [pendingSnap, reportsSnap, suspendedSnap, bannedSnap] = await Promise.all([
            getCountFromServer(pendingQuery),
            getCountFromServer(openReportsQuery),
            getCountFromServer(suspendedQuery),
            getCountFromServer(bannedQuery)
        ]);

        return {
            pendingSpots: pendingSnap.data().count,
            openReports: reportsSnap.data().count,
            suspendedUsers: suspendedSnap.data().count + bannedSnap.data().count
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { pendingSpots: 0, openReports: 0, suspendedUsers: 0 };
    }
}
// LOG ADMIN ACTION
export async function logAdminAction(action: string, details: any): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'admin_tool_logs'), {
        adminId: user.uid,
        action,
        details,
        createdAt: serverTimestamp()
    });
}

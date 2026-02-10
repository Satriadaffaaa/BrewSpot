import { adminDb } from '@/lib/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { AILogEntry, logAICall } from '@/features/ai/aiLogs';

const COLLECTION = 'ai_locks';
const LOCK_TTL_MINUTES = 2;

export async function acquireLock(lockKey: string): Promise<boolean> {
    const lockRef = adminDb.collection(COLLECTION).doc(lockKey);

    try {
        const lockSnap = await lockRef.get();

        if (lockSnap.exists) {
            const data = lockSnap.data();
            const expiresAt = data?.expiresAt; // Admin SDK returns Timestamp object
            const now = Timestamp.now();

            // Check if expired
            if (expiresAt && now.seconds > expiresAt.seconds) {
                // Lock expired, take it over
                await setLock(lockKey);
                return true;
            }
            // Lock active
            return false;
        }

        // Lock doesn't exist, create it
        await setLock(lockKey);
        return true;
    } catch (error) {
        console.error('AI Lock Error:', error);
        return false; // Fail safe
    }
}

async function setLock(lockKey: string) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + LOCK_TTL_MINUTES);

    await adminDb.collection(COLLECTION).doc(lockKey).set({
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt)
    });
}

export async function releaseLock(lockKey: string) {
    try {
        await adminDb.collection(COLLECTION).doc(lockKey).delete();
    } catch (error) {
        console.error('Failed to release lock:', lockKey, error);
    }
}

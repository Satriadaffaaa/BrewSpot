import { AI_CONFIG } from './aiConfig';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const DAILY_USAGE_COLLECTION = 'ai_usage';

export async function checkDailyLimit(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const countRef = adminDb.collection(DAILY_USAGE_COLLECTION).doc(today);

    try {
        const snap = await countRef.get();

        if (snap.exists) {
            const count = snap.data()?.count || 0;
            if (count >= AI_CONFIG.LIMITS.DAILY_GLOBAL_CALLS) {
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Limit check failed:', error);
        return false; // Fail safe
    }
}

export async function incrementDailyLimit() {
    const today = new Date().toISOString().split('T')[0];
    const countRef = adminDb.collection(DAILY_USAGE_COLLECTION).doc(today);

    try {
        await countRef.set({
            count: FieldValue.increment(1),
            updatedAt: new Date()
        }, { merge: true });
    } catch (e) {
        // Ignore increment error
        console.error('Failed to increment limit', e);
    }
}

export function isContentSufficient(text: string): boolean {
    return text.length >= 50;
}

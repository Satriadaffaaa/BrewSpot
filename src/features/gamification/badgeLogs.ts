import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface BadgeLog {
    userId: string;
    badgeId: string;
    awardedAt: any; // Timestamp
    triggerEvent: string;
}

export async function logBadgeAward(
    userId: string,
    badgeId: string,
    triggerEvent: string
): Promise<boolean> {
    const logId = `${userId}_badge_${badgeId}`;
    const logRef = doc(db, 'badge_logs', logId);

    // Check for existence to prevent duplicate awards
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
        console.log(`Badge ${badgeId} already awarded to ${userId}`);
        return false;
    }

    // Log the award
    await setDoc(logRef, {
        userId,
        badgeId,
        awardedAt: serverTimestamp(),
        triggerEvent
    });

    return true;
}

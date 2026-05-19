import { db } from '@/lib/firebase/client';
import { doc, runTransaction, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { UserStats, UserProfile } from './types';
import { mapToUserProfile } from './mappers';

// Denormalized structure for fast reads
export interface UserStatsSnapshot {
    userId: string;
    displayName: string;
    photoURL: string;
    totalXP: number;
    level: number;
    badgesCount: number;
    approvedBrewSpots: number;
    isContributor: boolean;
    updatedAt: Timestamp | Date | string | null | FieldValue;
}

// Update Snapshot atomically
export async function updateUserStatsSnapshot(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const snapshotRef = doc(db, 'user_stats_snapshots', userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return;

            const userData = mapToUserProfile(userSnap);
            const stats = userData.stats;
            const badges = userData.badges || [];

            const snapshot: UserStatsSnapshot = {
                userId,
                displayName: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || '',
                totalXP: userData.xp || 0,
                level: userData.level || 1,
                badgesCount: badges.length,
                approvedBrewSpots: stats?.brewspotApproved || 0,
                isContributor: userData.isContributor || false,
                updatedAt: serverTimestamp()
            };

            transaction.set(snapshotRef, snapshot);
        });
    } catch (error) {
        console.error("Failed to update user stats snapshot:", error);
    }
}

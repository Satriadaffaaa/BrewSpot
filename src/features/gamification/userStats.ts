import { db } from '@/lib/firebase/client';
import { doc, runTransaction, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { UserStats } from './types';

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
    updatedAt: any;
}

// Update Snapshot atomically
export async function updateUserStatsSnapshot(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const snapshotRef = doc(db, 'user_stats_snapshots', userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) return;

            const userData = userSnap.data();
            const stats = userData.stats as UserStats;
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

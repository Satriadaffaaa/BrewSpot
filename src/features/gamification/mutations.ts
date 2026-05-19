import { db } from '@/lib/firebase/client';
import {
    doc, getDoc, updateDoc, runTransaction,
    increment, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import {
    GlobalXPLog, UserProfile, CONTRIBUTOR_THRESHOLDS
} from './types';
import { calculateLevel } from './queries';
import { logBadgeAward } from './badgeLogs';
import { updateUserStatsSnapshot } from './userStats';
import { mapToUserProfile } from './mappers';

/**
 * Awards XP to a user for a specific action.
 */
export async function awardXP(
    userId: string,
    amount: number,
    action: GlobalXPLog['action'],
    referenceId: string
): Promise<void> {
    const xpLogRef = doc(db, 'xp_logs', `${userId}_${action}_${referenceId}`);
    const userRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. PERFORM ALL READS FIRST
            const logDoc = await transaction.get(xpLogRef);
            const userSnap = await transaction.get(userRef);

            // 2. CHECK IDEMPOTENCY
            if (logDoc.exists()) {
                console.log(`XP already awarded for ${action} on ${referenceId}`);
                return;
            }

            // 3. PERFORM WRITES
            transaction.set(xpLogRef, {
                userId,
                action,
                referenceId,
                amount,
                createdAt: serverTimestamp()
            });

            if (userSnap.exists()) {
                const userData = mapToUserProfile(userSnap);
                const newXP = (userData.xp || 0) + amount;
                const newLevel = calculateLevel(newXP);

                transaction.update(userRef, {
                    xp: newXP,
                    level: newLevel,
                    updatedAt: serverTimestamp()
                });
            }
        });

        // Post-transaction checks
        await checkContributorEligibility(userId);
        
        const freshUserSnap = await getDoc(userRef);
        if (freshUserSnap.exists()) {
            const data = mapToUserProfile(freshUserSnap);
            await checkAndAwardBadges(userId, data.stats, data.isContributor);
        }

        await updateUserStatsSnapshot(userId);

    } catch (error) {
        console.error("Failed to award XP:", error);
        throw error;
    }
}

/**
 * Updates user trust level based on an event.
 */
export async function updateTrustLevel(
    userId: string,
    reason: 'brewspot_approved' | 'brewspot_rejected'
): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        let trustChange = 0;
        if (reason === 'brewspot_approved') trustChange = 1;
        if (reason === 'brewspot_rejected') trustChange = -1;

        if (trustChange === 0) return;

        await updateDoc(userRef, {
            trustLevel: increment(trustChange),
            updatedAt: serverTimestamp()
        });

        await checkContributorEligibility(userId);
    } catch (error) {
        console.error(`Failed to update trust level for ${userId}:`, error);
    }
}

/**
 * Checks if a user is eligible for contributor status and awards it if they are.
 */
export async function checkContributorEligibility(userId: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);

        if (!snap.exists()) return false;

        const data = mapToUserProfile(snap);
        if (data.isContributor) return true;

        const isEligible =
            (data.trustLevel || 1) >= CONTRIBUTOR_THRESHOLDS.MIN_TRUST_LEVEL &&
            (data.xp || 0) >= CONTRIBUTOR_THRESHOLDS.MIN_XP &&
            (data.stats?.brewspotApproved || 0) >= CONTRIBUTOR_THRESHOLDS.MIN_APPROVED_SPOTS &&
            (data.stats?.brewspotRejected || 0) <= CONTRIBUTOR_THRESHOLDS.MAX_REJECTED_SPOTS;

        if (isEligible) {
            await updateDoc(userRef, {
                isContributor: true,
                updatedAt: serverTimestamp()
            });
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Failed to check contributor eligibility for ${userId}:`, error);
        return false;
    }
}

/**
 * Reactivates a user account if their suspension period has expired.
 */
export async function reactivateUserIfExpired(userId: string, suspensionUntil: string): Promise<void> {
    const now = new Date();
    const until = new Date(suspensionUntil);

    if (now > until) {
        const userRef = doc(db, 'users', userId);
        try {
            await updateDoc(userRef, {
                accountStatus: 'active',
                updatedAt: serverTimestamp()
            });
            console.log(`User ${userId} auto-reactivated.`);
        } catch (error) {
            console.error(`Auto-reactivation failed for user ${userId}:`, error);
        }
    }
}

/**
 * Checks and awards badges based on user stats.
 */
export async function checkAndAwardBadges(userId: string, stats: UserProfile['stats'], isContributor: boolean): Promise<void> {
    try {
        const badgesToAward: string[] = [];
        const totalReviews = stats?.totalReviews || 0;
        const approvedSpots = stats?.brewspotApproved || 0;
        const totalPhotos = stats?.totalReviewPhotos || 0;
        const totalLikes = stats?.totalLikesGiven || 0;

        // Reviews
        if (totalReviews >= 1) badgesToAward.push('first_review');
        if (totalReviews >= 5) badgesToAward.push('five_reviews');
        if (totalReviews >= 10) badgesToAward.push('ten_reviews');
        if (totalReviews >= 25) badgesToAward.push('twenty_five_reviews');
        if (totalReviews >= 50) badgesToAward.push('fifty_reviews');
        if (totalReviews >= 100) badgesToAward.push('hundred_reviews');

        // Approved Spots
        if (approvedSpots >= 1) badgesToAward.push('first_approved_spot');
        if (approvedSpots >= 5) badgesToAward.push('five_approved_spots');
        if (approvedSpots >= 10) badgesToAward.push('ten_approved_spots');
        if (approvedSpots >= 25) badgesToAward.push('twenty_five_approved_spots');
        if (approvedSpots >= 50) badgesToAward.push('fifty_approved_spots');

        // Photos
        if (totalPhotos >= 1) badgesToAward.push('first_photo');
        if (totalPhotos >= 10) badgesToAward.push('ten_photos');
        if (totalPhotos >= 50) badgesToAward.push('fifty_photos');

        // Likes
        if (totalLikes >= 1) badgesToAward.push('first_like');
        if (totalLikes >= 50) badgesToAward.push('fifty_likes');
        if (totalLikes >= 100) badgesToAward.push('hundred_likes');

        // Contributor
        if (isContributor) badgesToAward.push('contributor');

        if (badgesToAward.length === 0) return;

        const userRef = doc(db, 'users', userId);

        for (const badgeId of badgesToAward) {
            const success = await logBadgeAward(userId, badgeId, 'milestone_check');

            if (success) {
                await updateDoc(userRef, {
                    badges: arrayUnion(badgeId),
                    updatedAt: serverTimestamp()
                });
                console.log(`Badge ${badgeId} awarded to ${userId}`);
            }
        }
    } catch (error) {
        console.error(`Failed to check/award badges for ${userId}:`, error);
    }
}

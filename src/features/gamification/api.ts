import { db } from '@/lib/firebase/client';
import {
    collection, doc, getDoc, getDocs, updateDoc,
    setDoc, query, where, runTransaction,
    orderBy, limit,
    FieldValue,
    increment,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';
import {
    GlobalXPLog, UserProfile, XP_VALUES,
    CONTRIBUTOR_THRESHOLDS
} from './types';

// AWARD XP (Idempotent)
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
            // 1. PERFORM ALL READS FIRST (Required by Firestore)
            const logDoc = await transaction.get(xpLogRef);
            const userSnap = await transaction.get(userRef);

            // 2. CHECK IDEMPOTENCY
            if (logDoc.exists()) {
                console.log(`XP already awarded for ${action} on ${referenceId}`);
                return; // Already processed
            }

            // 3. PERFORM WRITES
            // Create Log
            transaction.set(xpLogRef, {
                userId,
                action,
                referenceId,
                amount,
                createdAt: serverTimestamp()
            });

            // Update User XP and Stats
            if (userSnap.exists()) {
                const userData = userSnap.data() as UserProfile;
                const newXP = (userData.xp || 0) + amount;
                const newLevel = calculateLevel(newXP);

                // Update Map
                const updatePayload: any = {
                    xp: newXP,
                    level: newLevel,
                    updatedAt: serverTimestamp()
                };

                transaction.update(userRef, updatePayload);
            }
        });

        // Post-transaction: Check contributor eligibility
        await checkContributorEligibility(userId);

        // Post-transaction: Check Badges
        // Need to re-fetch fresh stats effectively or pass them if we had them.
        // For simplicity/robustness, we fetch fresh stats inside checkAndAwardBadges or pass userSnap data if available?
        // userSnap data was OLD data.
        // Ideally we read fresh.
        const freshUserSnap = await getDoc(userRef);
        if (freshUserSnap.exists()) {
            const data = freshUserSnap.data() as UserProfile;
            await checkAndAwardBadges(userId, data.stats, data.isContributor);
        }

        // Post-transaction: Update User Stats Snapshot for Leaderboard
        await updateUserStatsSnapshot(userId);

    } catch (error) {
        console.error("Failed to award XP:", error);
        throw error;
    }
}

// CALCULATE LEVEL
export function calculateLevel(xp: number): number {
    // Level 1: 0-99
    // Level 2: 100-249
    // Level 3: 250-499
    // Level 4: 500+
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    // Level 5+ : Every 500 XP
    return 4 + Math.floor((xp - 500) / 500);
}

// UPDATE TRUST LEVEL
export async function updateTrustLevel(
    userId: string,
    reason: 'brewspot_approved' | 'brewspot_rejected'
): Promise<void> {
    const userRef = doc(db, 'users', userId);

    // Simple Increment/Decrement Logic
    let trustChange = 0;
    if (reason === 'brewspot_approved') trustChange = 1;
    if (reason === 'brewspot_rejected') trustChange = -1;

    if (trustChange === 0) return;

    await updateDoc(userRef, {
        trustLevel: increment(trustChange),
        updatedAt: serverTimestamp()
    });

    // Re-check contributor status
    await checkContributorEligibility(userId);
}

// CHECK CONTRIBUTOR ELIGIBILITY
export async function checkContributorEligibility(userId: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return false;

    const data = snap.data() as UserProfile;
    if (data.isContributor) return true; // Already contributor

    // Check Thresholds
    const isEligible =
        (data.trustLevel || 1) >= CONTRIBUTOR_THRESHOLDS.MIN_TRUST_LEVEL &&
        (data.xp || 0) >= CONTRIBUTOR_THRESHOLDS.MIN_XP &&
        (data.stats?.brewspotApproved || 0) >= CONTRIBUTOR_THRESHOLDS.MIN_APPROVED_SPOTS &&
        (data.stats?.brewspotRejected || 0) <= CONTRIBUTOR_THRESHOLDS.MAX_REJECTED_SPOTS;
    // Account age check omitted for simplicity in Phase 2 or fetched from Auth

    if (isEligible) {
        await updateDoc(userRef, {
            isContributor: true,
            updatedAt: serverTimestamp()
        });
        return true;
    }

    return false;
}

// GET LEADERBOARD
export async function getLeaderboard(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(
        usersRef,
        orderBy('xp', 'desc'),
        limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    } as UserProfile));
}

// GET USER PROFILE
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as UserProfile;
}
// REACTIVATE USER IF EXPIRED
export async function reactivateUserIfExpired(userId: string, suspensionUntil: string): Promise<void> {
    const now = new Date();
    const until = new Date(suspensionUntil);

    if (now > until) {
        // Attempt to reactivate
        const userRef = doc(db, 'users', userId);
        try {
            await updateDoc(userRef, {
                accountStatus: 'active',
                updatedAt: serverTimestamp()
            });
            console.log(`User ${userId} auto-reactivated.`);
        } catch (error) {
            console.error("Auto-reactivation failed:", error);
            // Likely rules blocked it or network error
        }
    }
}

import { logBadgeAward } from './badgeLogs';
import { BADGE_DEFINITIONS } from './badges';
import { updateUserStatsSnapshot } from './userStats';

// CHECK AND AWARD BADGES
export async function checkAndAwardBadges(userId: string, stats: any, isContributor: boolean): Promise<void> {
    const badgesToAward: string[] = [];
    const totalReviews = stats?.totalReviews || 0;
    const approvedSpots = stats?.brewspotApproved || 0;

    // 1. Check Conditions
    // 1. Check Conditions

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
    const totalPhotos = stats?.totalReviewPhotos || 0;
    if (totalPhotos >= 1) badgesToAward.push('first_photo');
    if (totalPhotos >= 10) badgesToAward.push('ten_photos');
    if (totalPhotos >= 50) badgesToAward.push('fifty_photos');

    // Likes
    const totalLikes = stats?.totalLikesGiven || 0;
    if (totalLikes >= 1) badgesToAward.push('first_like');
    if (totalLikes >= 50) badgesToAward.push('fifty_likes');
    if (totalLikes >= 100) badgesToAward.push('hundred_likes');

    // Contributor
    if (isContributor) badgesToAward.push('contributor');

    // 2. Process Awards
    if (badgesToAward.length === 0) return;

    const userRef = doc(db, 'users', userId);

    for (const badgeId of badgesToAward) {
        // Log & Deduplicate (Atomic-ish via existence check in logBadgeAward)
        // triggerEvent is generic 'system_check' or derived from context. 
        // For simplicity, we use 'milestone_check'.
        const success = await logBadgeAward(userId, badgeId, 'milestone_check');

        if (success) {
            // If successfully logged (first time), update User Profile
            await updateDoc(userRef, {
                badges: arrayUnion(badgeId),
                updatedAt: serverTimestamp()
            });
            console.log(`Badge ${badgeId} awarded to ${userId}`);
        }
    }
}


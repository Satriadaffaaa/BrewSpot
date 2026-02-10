import { UserStats } from './types';
import { BADGE_DEFINITIONS } from './badges';

export interface BadgeProgress {
    current: number;
    target: number;
    percentage: number;
    isUnlocked: boolean;
}

export function getBadgeProgress(badgeId: string, stats: UserStats | undefined): BadgeProgress {
    // Default stats if undefined
    const safeStats: UserStats = stats || {
        brewspotSubmitted: 0,
        brewspotApproved: 0,
        brewspotRejected: 0,
        totalReviews: 0,
        totalReviewPhotos: 0,
        totalLikesGiven: 0
    };

    let current = 0;
    let target = 0;

    switch (badgeId) {
        // Reviews
        case 'first_review':
            current = safeStats.totalReviews;
            target = 1;
            break;
        case 'five_reviews':
            current = safeStats.totalReviews;
            target = 5;
            break;
        case 'ten_reviews':
            current = safeStats.totalReviews;
            target = 10;
            break;
        case 'twenty_five_reviews':
            current = safeStats.totalReviews;
            target = 25;
            break;
        case 'fifty_reviews':
            current = safeStats.totalReviews;
            target = 50;
            break;
        case 'hundred_reviews':
            current = safeStats.totalReviews;
            target = 100;
            break;

        // Approved Spots
        case 'first_approved_spot':
            current = safeStats.brewspotApproved;
            target = 1;
            break;
        case 'five_approved_spots':
            current = safeStats.brewspotApproved;
            target = 5;
            break;
        case 'ten_approved_spots':
            current = safeStats.brewspotApproved;
            target = 10;
            break;
        case 'twenty_five_approved_spots':
            current = safeStats.brewspotApproved;
            target = 25;
            break;
        case 'fifty_approved_spots':
            current = safeStats.brewspotApproved;
            target = 50;
            break;

        // Photos
        case 'first_photo':
            current = safeStats.totalReviewPhotos;
            target = 1;
            break;
        case 'ten_photos':
            current = safeStats.totalReviewPhotos;
            target = 10;
            break;
        case 'fifty_photos':
            current = safeStats.totalReviewPhotos;
            target = 50;
            break;

        // Likes
        case 'first_like':
            current = safeStats.totalLikesGiven;
            target = 1;
            break;
        case 'fifty_likes':
            current = safeStats.totalLikesGiven;
            target = 50;
            break;
        case 'hundred_likes':
            current = safeStats.totalLikesGiven;
            target = 100;
            break;

        // Special / Manual Badges
        case 'contributor':
            // This is boolean based, so we just check if unlocked really
            // But for progress bar sake, we could map to a binary 0 or 1
            // Or maybe complex logic based on contributor requirements.
            // For now, let's treat it as binary.
            current = 0; // Contributor status usually stored on profile, not just stats.
            target = 1;
            break;

        default:
            current = 0;
            target = 1;
    }

    // Special handling for Contributor badge which depends on a flag not just stats
    // We will handle the "isUnlocked" check in the component by checking the user's unlocked badges array
    // This function focuses on *progress* towards the *requirements*.
    // However, since we don't have the user object here, just stats, we can't fully know if Contributor is unlocked.
    // The calling component should override `isUnlocked` if it knows better.

    // For badges that are purely stat-based:
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));
    const isUnlocked = current >= target;

    return {
        current,
        target,
        percentage,
        isUnlocked
    };
}

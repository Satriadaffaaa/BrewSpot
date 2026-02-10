export interface UserStats {
    brewspotSubmitted: number
    brewspotApproved: number
    brewspotRejected: number
    totalReviews: number
    totalReviewPhotos: number
    totalLikesGiven: number
    totalCheckIns?: number // Leaderboard
    totalViews?: number // Phase 8: Analytics
}

export interface UserProfile {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    role: 'user' | 'admin'

    // Gamification
    xp: number
    level: number
    trustLevel: number // Default 1
    isContributor: boolean // Auto-approval privilege

    stats: UserStats
    badges?: string[] // Phase 4: Gamification Badges

    // Phase 3: Safety & Enforcement
    accountStatus?: 'active' | 'warned' | 'suspended' | 'banned'
    suspensionUntil?: string | null // ISO Date string
    lastUsernameChange?: any // Timestamp or Date

    createdAt: string
    updatedAt: string
}

export interface GlobalXPLog {
    id: string
    userId: string
    action: 'approve_spot' | 'review' | 'upload_photo' | 'like'
    referenceId: string // reviewId | brewspotId
    amount: number
    createdAt: string
}

// Constants for XP System
export const XP_VALUES = {
    APPROVE_SPOT: 50,
    REVIEW: 10,
    UPLOAD_PHOTO: 5,
    LIKE: 2
} as const

// Thresholds for Contributor
export const CONTRIBUTOR_THRESHOLDS = {
    MIN_TRUST_LEVEL: 3,
    MIN_XP: 300,
    MIN_APPROVED_SPOTS: 4,
    MAX_REJECTED_SPOTS: 1,
    MIN_ACCOUNT_AGE_DAYS: 30
} as const

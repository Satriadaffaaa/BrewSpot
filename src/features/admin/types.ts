
import { BrewSpot } from '../brewspot/types';

export interface AdminUser {
    uid: string;
    email: string | null;
    role: 'admin' | 'user';
}

export type BrewSpotStatus = 'pending' | 'approved' | 'rejected';

export interface AdminBrewSpot extends BrewSpot {
    status: BrewSpotStatus;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
}

export interface AdminNote {
    id: string
    targetId: string // User ID, Review ID, or BrewSpot ID
    targetType: 'user' | 'review' | 'brewspot'
    content: string
    authorId: string
    authorName?: string
    createdAt: string
}

export interface GlobalSettings {
    enableAutoApproval: boolean
    // Future expansion: maintenanceMode, etc.
}

export interface ReviewPhotoModerationLog {
    id: string
    photoUrl: string
    reviewId: string
    adminId: string
    reason: string
    timestamp: string
}

// Phase 3: Reporting & Moderation

export enum ReportReason {
    SPAM = 'spam',
    FAKE_INFORMATION = 'fake_information',
    INAPPROPRIATE_CONTENT = 'inappropriate_content',
    HARASSMENT = 'harassment',
    DUPLICATE = 'duplicate',
    OTHER = 'other'
}

export interface Report {
    id: string
    targetType: 'brewspot' | 'review' | 'photo' | 'user'
    targetId: string
    reportedBy: string // User ID
    reason: ReportReason
    description?: string
    status: 'open' | 'reviewed' | 'dismissed'
    createdAt: string
    updatedAt?: string // When status changed
}

export type EnforcementType = 'warning' | 'suspension' | 'ban'

export interface EnforcementAction {
    id: string
    userId: string
    adminId: string
    actionType: EnforcementType
    durationHours?: number // For suspension
    reason: string
    createdAt: string
}

export interface ModerationLog {
    id: string
    actionType: 'hide_review' | 'hide_photo' | 'override_contributor' | 'resolve_report' | 'enforce_user'
    targetType: 'review' | 'photo' | 'user' | 'report' | 'brewspot'
    targetId: string
    adminId: string
    reason: string
    metadata?: any // Flexible for extra details
    createdAt: string
}

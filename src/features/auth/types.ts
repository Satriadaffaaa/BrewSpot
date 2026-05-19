import { UserStats } from '../gamification/types';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'user' | 'admin' | 'owner';

    // Gamification
    xp: number;
    level: number;
    trustLevel: number;
    isContributor: boolean;

    stats: UserStats;
    badges?: string[];

    // Phase 3: Safety & Enforcement
    accountStatus?: 'active' | 'warned' | 'suspended' | 'banned';
    suspensionUntil?: string | null;
    lastUsernameChange?: string | null;

    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileInput {
    displayName?: string;
    photoFile?: File;
}

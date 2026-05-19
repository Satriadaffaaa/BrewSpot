import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { UserProfile, GlobalXPLog, UserStats } from './types';

/**
 * Maps a Firestore document to a UserProfile object.
 */
export function mapToUserProfile(doc: QueryDocumentSnapshot<DocumentData> | DocumentData, id?: string): UserProfile {
    const data = (typeof doc.data === 'function' ? doc.data() : doc) as Record<string, unknown>;
    const uid = id || (doc as QueryDocumentSnapshot).id || '';

    const getString = (val: unknown): string | null => typeof val === 'string' ? val : null;
    const getBoolean = (val: unknown): boolean => typeof val === 'boolean' ? val : false;
    const getNumber = (val: unknown): number => typeof val === 'number' ? val : 0;
    const getDateString = (val: unknown): string => {
        if (val && typeof (val as any).toDate === 'function') {
            return (val as any).toDate().toISOString();
        }
        return typeof val === 'string' ? val : '';
    };

    return {
        uid,
        email: getString(data.email),
        displayName: getString(data.displayName),
        photoURL: getString(data.photoURL),
        role: (data.role as UserProfile['role']) || 'user',
        xp: getNumber(data.xp),
        level: getNumber(data.level) || 1,
        trustLevel: getNumber(data.trustLevel) || 1,
        isContributor: getBoolean(data.isContributor),
        stats: mapToUserStats(data.stats as Record<string, unknown> | undefined),
        badges: Array.isArray(data.badges) ? data.badges : [],
        accountStatus: (data.accountStatus as UserProfile['accountStatus']) || 'active',
        suspensionUntil: getString(data.suspensionUntil),
        lastUsernameChange: getString(data.lastUsernameChange),
        createdAt: getDateString(data.createdAt),
        updatedAt: getDateString(data.updatedAt)
    };
}

/**
 * Maps a Firestore document to a UserStats object.
 */
export function mapToUserStats(data: Record<string, unknown> | undefined): UserStats {
    const stats = data || {};
    
    const getNumber = (val: unknown): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return Number(val) || 0;
        return 0;
    };

    return {
        brewspotSubmitted: getNumber(stats.brewspotSubmitted),
        brewspotApproved: getNumber(stats.brewspotApproved),
        brewspotRejected: getNumber(stats.brewspotRejected),
        totalReviews: getNumber(stats.totalReviews),
        totalReviewPhotos: getNumber(stats.totalReviewPhotos),
        totalLikesGiven: getNumber(stats.totalLikesGiven),
        totalCheckIns: getNumber(stats.totalCheckIns),
        totalViews: getNumber(stats.totalViews)
    };
}

/**
 * Maps a Firestore document to a GlobalXPLog object.
 */
export function mapToXPLog(doc: QueryDocumentSnapshot<DocumentData>): GlobalXPLog {
    const data = doc.data();
    return {
        id: doc.id,
        userId: data.userId || '',
        action: data.action || '',
        referenceId: data.referenceId || '',
        amount: data.amount || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || ''
    };
}

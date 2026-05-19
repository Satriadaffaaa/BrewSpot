import { DocumentData } from 'firebase/firestore';
import { UserProfile } from './types';

export function mapToUserProfile(doc: DocumentData): UserProfile {
    return {
        uid: doc.uid || '',
        email: doc.email || null,
        displayName: doc.displayName || null,
        photoURL: doc.photoURL || null,
        role: doc.role || 'user',
        xp: doc.xp || 0,
        level: doc.level || 1,
        trustLevel: doc.trustLevel || 1,
        isContributor: doc.isContributor || false,
        stats: {
            brewspotSubmitted: doc.stats?.brewspotSubmitted || 0,
            brewspotApproved: doc.stats?.brewspotApproved || 0,
            brewspotRejected: doc.stats?.brewspotRejected || 0,
            totalReviews: doc.stats?.totalReviews || 0,
            totalReviewPhotos: doc.stats?.totalReviewPhotos || 0,
            totalLikesGiven: doc.stats?.totalLikesGiven || 0,
            totalCheckIns: doc.stats?.totalCheckIns || 0,
            totalViews: doc.stats?.totalViews || 0,
        },
        badges: doc.badges || [],
        accountStatus: doc.accountStatus || 'active',
        suspensionUntil: doc.suspensionUntil || null,
        lastUsernameChange: doc.lastUsernameChange?.toDate?.()?.toISOString() || 
                           (typeof doc.lastUsernameChange === 'string' ? doc.lastUsernameChange : null),
        createdAt: doc.createdAt?.toDate?.()?.toISOString() || 
                  (typeof doc.createdAt === 'string' ? doc.createdAt : new Date().toISOString()),
        updatedAt: doc.updatedAt?.toDate?.()?.toISOString() || 
                  (typeof doc.updatedAt === 'string' ? doc.updatedAt : new Date().toISOString()),
    };
}

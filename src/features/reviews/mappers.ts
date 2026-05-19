import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { Review } from '@/features/brewspot/types';

export function mapToReview(doc: DocumentSnapshot | QueryDocumentSnapshot): Review {
    const data = doc.data();
    if (!data) {
        throw new Error('Review data is missing');
    }

    return {
        id: doc.id,
        brewspotId: data.brewspotId || '',
        userId: data.userId || '',
        userName: data.userName || 'Anonymous',
        userAvatar: data.userAvatar || null,
        brewspotName: data.brewspotName || 'Unknown Spot',
        rating: data.rating || 0,
        opinion: data.opinion || '',
        photos: data.photos || [],
        videoUrl: data.videoUrl || null,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
        isHidden: data.isHidden || false,
        hiddenAt: data.hiddenAt || null,
        hiddenBy: data.hiddenBy || null,
        hiddenReason: data.hiddenReason || null,
        aiMeta: data.aiMeta || undefined,
    } as Review;
}

import { db } from '@/lib/firebase/client';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    doc,
    getDoc
} from 'firebase/firestore';
import { Review } from '@/features/brewspot/types';
import { getPublicReviews } from '@/features/shared/queries';
import { mapToReview } from './mappers';

export async function getReviews(brewspotId: string): Promise<Review[]> {
    return getPublicReviews(brewspotId);
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
    const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(q);

    const reviews = await Promise.all(snap.docs.map(async (docSnapshot) => {
        const review = mapToReview(docSnapshot);
        
        // Phase 2.7: Backfill brewspotName if missing (for legacy data)
        if (review.brewspotName === 'Unknown Spot' && review.brewspotId) {
            try {
                const spotRef = doc(db, 'brewspots', review.brewspotId);
                const spotSnap = await getDoc(spotRef);
                if (spotSnap.exists()) {
                    review.brewspotName = spotSnap.data()?.name || 'Unknown Spot';
                }
            } catch (err) {
                console.warn(`Failed to fetch brewspot name for review ${docSnapshot.id}`, err);
            }
        }

        return review;
    }));

    return reviews;
}

export async function getAllReviewsForAdmin(limitCount: number = 50): Promise<Review[]> {
    const q = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snap = await getDocs(q);
    return snap.docs.map(mapToReview);
}

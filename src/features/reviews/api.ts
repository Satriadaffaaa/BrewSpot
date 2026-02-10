import { db, auth } from '@/lib/firebase/client';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    limit,
    runTransaction
} from 'firebase/firestore';
import { Review, ReviewInput } from '@/features/brewspot/types';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { awardXP } from '@/features/gamification/api';
import { XP_VALUES } from '@/features/gamification/types';

export async function addReview(brewspotId: string, input: ReviewInput, brewspotName?: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    // Sanitize folder path
    const folderPath = brewspotName
        ? `brewspots/${brewspotName.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}/reviews`
        : 'brewspots/reviews';

    // 1. Upload Photos first (if any)
    const photoUrls: string[] = [];
    if (input.photos && input.photos.length > 0) {
        const filesToUpload = input.photos.slice(0, 3);
        try {
            const uploaded = await Promise.all(
                filesToUpload.map(file => uploadToCloudinary(file, folderPath))
            );
            photoUrls.push(...uploaded);
        } catch (error) {
            console.error("Photo upload failed", error);
        }
    }

    // 2. Validate Rate Limits & Update
    try {
        const reviewId = await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            const limitsRef = doc(db, 'users', user.uid, 'limits', 'daily'); // Single doc for limits
            const spotRef = doc(db, 'brewspots', brewspotId);

            // Validate spot existence
            const spotSnap = await transaction.get(spotRef);
            if (!spotSnap.exists()) throw new Error("BrewSpot not found");

            // READ FIRST: Validate User Stats & Limits
            const userSnap = await transaction.get(userRef);
            const limitsSnap = await transaction.get(limitsRef);

            // Rate Limit Logic
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const MAX_REVIEWS_PER_DAY = 5;

            let currentCount = 0;
            if (limitsSnap.exists()) {
                const data = limitsSnap.data();
                if (data.lastReviewDate === today) {
                    currentCount = data.reviewsToday || 0;
                }
            }

            if (currentCount >= MAX_REVIEWS_PER_DAY) {
                throw new Error(`Daily review limit reached (${MAX_REVIEWS_PER_DAY}). Please try again tomorrow.`);
            }

            // 3. Update BrewSpot Aggregates (Rating & Count)
            const currentRating = spotSnap.data()?.rating || 0;
            const currentReviewsCount = spotSnap.data()?.reviews_count || 0;

            // Calculate new average
            // Formula: ((old_avg * old_count) + new_rating) / (old_count + 1)
            const newReviewsCount = currentReviewsCount + 1;
            const newRating = ((currentRating * currentReviewsCount) + input.rating) / newReviewsCount;

            transaction.update(spotRef, {
                rating: newRating,
                reviews_count: newReviewsCount
            });

            // Create Review Ref
            const newReviewRef = doc(collection(db, 'reviews'));

            // Update User Stats
            if (userSnap.exists()) {
                transaction.update(userRef, {
                    'stats.totalReviews': (userSnap.data()?.stats?.totalReviews || 0) + 1
                });
            }

            // Update Limits
            transaction.set(limitsRef, {
                reviewsToday: currentCount + 1,
                lastReviewDate: today,
                updatedAt: serverTimestamp()
            }, { merge: true });

            transaction.set(newReviewRef, {
                brewspotId,
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userAvatar: user.photoURL,
                brewspotName: brewspotName || '', // Persist name
                rating: input.rating,
                opinion: input.opinion,
                photos: photoUrls,
                videoUrl: input.videoUrl || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return newReviewRef.id;
        });

        // Post-Transaction: Create separate review_photos entries
        if (photoUrls.length > 0) {
            const photoPromises = photoUrls.map(url => {
                return addDoc(collection(db, 'review_photos'), {
                    reviewId,
                    brewspotId,
                    url,
                    storagePath: '',
                    uploadedBy: user.uid,
                    createdAt: serverTimestamp()
                } as any);
            });
            await Promise.all(photoPromises);
        }

        // Award XP
        await awardXP(user.uid, XP_VALUES.REVIEW, 'review', reviewId);

        if (photoUrls.length > 0) {
            for (let i = 0; i < photoUrls.length; i++) {
                await awardXP(user.uid, XP_VALUES.UPLOAD_PHOTO, 'upload_photo', `${reviewId}_photo_${i}`);
            }
        }

        // Phase 7: Trigger AI Analysis (Fire & Forget)
        // We import dynamically to ensure no bundling issues if relevant, but direct import is fine for Actions.
        import('@/features/ai/actions').then(({ triggerReviewAnalysisAction }) => {
            triggerReviewAnalysisAction(brewspotId).catch(err => console.error("AI Trigger Error:", err));
        });

        return reviewId;
    } catch (error) {
        console.error("Add Review Failed:", error);
        throw error;
    }
}

import { getPublicReviews } from '@/features/shared/queries';

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

    // Phase 2.7: Backfill brewspotName if missing (for legacy data)
    const reviews = await Promise.all(snap.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let brewspotName = data.brewspotName;

        if (!brewspotName && data.brewspotId) {
            try {
                // Fetch name on the fly if missing
                const spotRef = doc(db, 'brewspots', data.brewspotId);
                const { getDoc } = await import('firebase/firestore'); // Lazy load
                const spotSnap = await getDoc(spotRef);
                if (spotSnap.exists()) {
                    brewspotName = spotSnap.data()?.name;
                }
            } catch (err) {
                console.warn(`Failed to fetch brewspot name for review ${docSnapshot.id}`, err);
            }
        }

        return {
            id: docSnapshot.id,
            ...data,
            brewspotName: brewspotName || 'Unknown Spot',
            createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString()
        } as Review;
    }));

    return reviews;
}

export async function deleteReview(reviewId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const reviewRef = doc(db, 'reviews', reviewId);

    // Check ownership before delete to avoid partial failures if Rules block it
    const snap = await import('firebase/firestore').then(mod => mod.getDoc(reviewRef));
    if (!snap.exists()) return;
    if (snap.data()?.userId !== user.uid) throw new Error("Not authorized to delete this review");

    await deleteDoc(reviewRef);
}

export async function updateReview(
    reviewId: string,
    input: { rating: number, opinion: string, newPhotos: File[], existingPhotoUrls: string[], videoUrl?: string },
    brewspotName?: string
): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const reviewRef = doc(db, 'reviews', reviewId);
    // Explicitly import getDoc to avoid conflict if not imported or ensure availability
    const { getDoc } = await import('firebase/firestore');
    const snap = await getDoc(reviewRef);

    if (!snap.exists()) throw new Error("Review not found");
    // Ensure ownership check uses data safely
    const data = snap.data();
    if (!data || data.userId !== user.uid) throw new Error("Not authorized to edit this review");

    // 1. Upload New Photos
    const newPhotoUrls: string[] = [];
    if (input.newPhotos && input.newPhotos.length > 0) {
        try {
            // Sanitize folder path for update
            const folderPath = brewspotName
                ? `brewspots/${brewspotName.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}/reviews`
                : 'brewspots/reviews';

            const uploaded = await Promise.all(
                input.newPhotos.map(file => uploadToCloudinary(file, folderPath))
            );
            newPhotoUrls.push(...uploaded);
        } catch (error) {
            console.error("Photo upload failed", error);
            throw new Error("Failed to upload new photos");
        }
    }

    // 2. Merge URLs
    const finalPhotoUrls = [...input.existingPhotoUrls, ...newPhotoUrls].slice(0, 3);

    // 3. Update Doc
    await updateDoc(reviewRef, {
        rating: input.rating,
        opinion: input.opinion,
        photos: finalPhotoUrls,
        videoUrl: input.videoUrl || null,
        updatedAt: serverTimestamp()
    });
}

// Phase 2: Admin Moderation
export async function toggleReviewVisibility(reviewId: string, isHidden: boolean, reason?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");
    // Verify admin role strictly in secure environment or assumed by UI guard here

    const reviewRef = doc(db, 'reviews', reviewId);

    // We update metadata regardless of hide/show for audit trail
    await updateDoc(reviewRef, {
        isHidden: isHidden,
        hiddenAt: isHidden ? new Date().toISOString() : null,
        hiddenBy: isHidden ? user.uid : null,
        hiddenReason: isHidden ? (reason || null) : null
    });
}

export async function getAllReviewsForAdmin(limitCount: number = 50): Promise<Review[]> {
    const q = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
}

export async function hideReviewPhoto(reviewId: string, photoUrl: string, reason: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const reviewRef = doc(db, 'reviews', reviewId);

    // In Phase 2, we just remove it from the 'photos' array or move it to 'hiddenPhotos'.
    // Implementing 'hiddenPhotos' array pattern.

    await runTransaction(db, async (transaction) => {
        const reviewDoc = await transaction.get(reviewRef);
        if (!reviewDoc.exists()) throw new Error("Review not found");

        const data = reviewDoc.data() as Review;
        const currentPhotos = data.photos || [];

        if (!currentPhotos.includes(photoUrl)) return; // Already gone

        // Move from photos -> hiddenPhotos (if we added that field, lets check types.ts)
        // If not added to types, we soft delete by just removing from photos array but LOGGING it.
        // The plan mentioned soft-hide only.

        const newPhotos = currentPhotos.filter(p => p !== photoUrl);

        transaction.update(reviewRef, {
            photos: newPhotos,
            // If we had hiddenPhotos: arrayUnion(photoUrl)
        });

        // Log to Admin Notes (Audit)
        // We can't use helper function inside transaction easily if it uses different doc refs usually, 
        // but addAdminNote uses addDoc which is fine outside transaction or we allow it.
        // Let's do it after transaction or separate.
    });

    // Audit Log
    const { addAdminNote } = await import('@/features/admin/api'); // Lazy load to avoid circular deps if any
    await addAdminNote(reviewId, 'review', `Photo hidden: ${photoUrl}. Reason: ${reason}`);
}

import { db, auth } from '@/lib/firebase/client';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    deleteDoc,
    runTransaction,
    getDoc
} from 'firebase/firestore';
import { Review, ReviewInput } from '@/features/brewspot/types';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { awardXP } from '@/features/gamification/api';
import { XP_VALUES } from '@/features/gamification/types';
import { mapToReview } from './mappers';

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
            if (!spotSnap.exists()) throw new Error("Spot not found");

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
                });
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
        import('@/features/ai/actions').then(({ triggerReviewAnalysisAction }) => {
            triggerReviewAnalysisAction(brewspotId).catch(err => console.error("AI Trigger Error:", err));
        });

        return reviewId;
    } catch (error) {
        console.error("Add Review Failed:", error);
        throw error;
    }
}

export async function deleteReview(reviewId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const reviewRef = doc(db, 'reviews', reviewId);

    const snap = await getDoc(reviewRef);
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
    const snap = await getDoc(reviewRef);

    if (!snap.exists()) throw new Error("Review not found");
    const data = snap.data();
    if (!data || data.userId !== user.uid) throw new Error("Not authorized to edit this review");

    // 1. Upload New Photos
    const newPhotoUrls: string[] = [];
    if (input.newPhotos && input.newPhotos.length > 0) {
        try {
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

export async function toggleReviewVisibility(reviewId: string, isHidden: boolean, reason?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const reviewRef = doc(db, 'reviews', reviewId);

    await updateDoc(reviewRef, {
        isHidden: isHidden,
        hiddenAt: isHidden ? new Date().toISOString() : null,
        hiddenBy: isHidden ? user.uid : null,
        hiddenReason: isHidden ? (reason || null) : null
    });
}

export async function hideReviewPhoto(reviewId: string, photoUrl: string, reason: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const reviewRef = doc(db, 'reviews', reviewId);

    await runTransaction(db, async (transaction) => {
        const reviewDoc = await transaction.get(reviewRef);
        if (!reviewDoc.exists()) throw new Error("Review not found");

        const review = mapToReview(reviewDoc);
        const currentPhotos = review.photos || [];

        if (!currentPhotos.includes(photoUrl)) return;

        const newPhotos = currentPhotos.filter(p => p !== photoUrl);

        transaction.update(reviewRef, {
            photos: newPhotos
        });
    });

    const { addAdminNote } = await import('@/features/admin/api');
    await addAdminNote(reviewId, 'review', `Photo hidden: ${photoUrl}. Reason: ${reason}`);
}

'use server'

import { generateTagsFromText, generateTagsFromReviews } from '@/lib/ai/aiService';
import { adminDb } from '@/lib/firebase/admin';
import { AI_CONFIG } from '@/lib/ai/aiConfig';

export async function generateTagsAction(description: string, existingTags: string[]) {
    try {
        const newTags = await generateTagsFromText(description, existingTags);
        return { success: true, tags: newTags };
    } catch (error) {
        console.error("AI Tag Generation Failed:", error);
        return { success: false, error: "Failed to generate tags" };
    }
}

export async function triggerReviewAnalysisAction(brewspotId: string) {
    // Graceful exit if adminDb not initialized (e.g. missing keys)
    if (!adminDb) {
        console.warn("Skipping AI analysis: Admin DB not initialized");
        return;
    }

    try {
        const spotRef = adminDb.collection('brewspots').doc(brewspotId);
        const spotSnap = await spotRef.get();
        if (!spotSnap.exists) return;

        const data = spotSnap.data();
        const reviewCount = data?.reviews_count || 0;
        const description = data?.description || '';

        // Check Threshold (e.g. every 5 reviews)
        const threshold = AI_CONFIG.LIMITS.REVIEW_THRESHOLD_FOR_AI_UPDATE || 5;

        // Note: reviewCount is already updated by the client transaction before calling this
        if (reviewCount > 0 && reviewCount % threshold === 0) {
            console.log(`[AI Trigger] Analysis triggered for ${brewspotId} at ${reviewCount} reviews.`);

            // Fetch last 10 reviews
            const reviewsSnap = await adminDb.collection('reviews')
                .where('brewspotId', '==', brewspotId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const reviewTexts = reviewsSnap.docs.map(d => d.data().opinion as string).filter(Boolean);

            if (reviewTexts.length < 3) return; // Not enough context

            // Generate Tags
            const newTags = await generateTagsFromReviews(description, reviewTexts);

            if (newTags.length > 0) {
                // Update BrewSpot with AI Meta
                // We merge with existing aiMeta if needed, but for now we overwrite tags
                await spotRef.set({
                    aiMeta: {
                        tags: newTags,
                        generatedAt: new Date().toISOString(),
                        version: AI_CONFIG.VERSIONS.REVIEW_SUMMARIZER
                    }
                }, { merge: true });
                console.log(`[AI Trigger] Updated tags for ${brewspotId}:`, newTags);
            }
        }
    } catch (error) {
        console.error("AI Review Analysis Failed:", error);
    }
}

export async function forceRegenerateTagsAction(brewspotId: string) {
    if (!adminDb) return { success: false, error: 'No Admin DB' };

    try {
        const spotRef = adminDb.collection('brewspots').doc(brewspotId);
        const spotSnap = await spotRef.get();
        if (!spotSnap.exists) return { success: false, error: 'Not Found' };

        const data = spotSnap.data();
        const description = data?.description || '';

        // Strategy: If reviews exist, use them. If not, use description only.
        const reviewsSnap = await adminDb.collection('reviews')
            .where('brewspotId', '==', brewspotId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const reviewTexts = reviewsSnap.docs.map(d => d.data().opinion as string).filter(Boolean);

        let newTags: string[] = [];

        if (reviewTexts.length >= 1) {
            newTags = await generateTagsFromReviews(description, reviewTexts);
        } else {
            newTags = await generateTagsFromText(description, data?.tags || []);
        }

        await spotRef.set({
            aiMeta: {
                tags: newTags,
                generatedAt: new Date().toISOString(),
                version: 'force-admin-v1'
            }
        }, { merge: true });

        return { success: true, count: newTags.length };

    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed' };
    }
}
// ... existing code ...

export async function generateBrewSpotTagsAction(spotId: string) {
    // Reuse the robust Admin logic that handles both Description and Reviews
    return await forceRegenerateTagsAction(spotId);
}

export async function generateBrewSpotSummaryAction(brewSpotId: string) {
    const { generateReviewSummary } = await import('@/features/ai/reviewSummarizer');
    try {
        const result = await generateReviewSummary(brewSpotId, true); // Force generation for manual trigger
        if (!result) return { success: false, error: 'Not enough reviews' };
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed' };
    }
}

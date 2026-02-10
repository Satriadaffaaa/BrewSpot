import { adminDb } from '@/lib/firebase/admin';
import { executeAISafe } from '@/lib/ai/aiService';
import { AI_CONFIG } from '@/lib/ai/aiConfig';

export interface ReviewSummaryResult {
    summary: string;
    pros: string[];
    cons: string[];
    generatedAt: string;
    version: string;
}

export async function generateReviewSummary(brewSpotId: string, force: boolean = false): Promise<ReviewSummaryResult | null> {
    if (!adminDb) {
        console.error("Admin DB not initialized");
        throw new Error("Admin DB not initialized");
    }

    const spotRef = adminDb.collection('brewspots').doc(brewSpotId);
    const spotSnap = await spotRef.get();

    if (!spotSnap.exists) {
        throw new Error("BrewSpot not found");
    }

    const data = spotSnap.data();

    // Check if summary already exists and is recent/same version (unless forced)
    if (!force && data?.ai_summary && data.ai_summary.version === AI_CONFIG.VERSIONS.REVIEW_SUMMARIZER) {
        console.log(`Skipping summary generation for ${brewSpotId}: Already exists and up to date.`);
        return data.ai_summary as ReviewSummaryResult;
    }

    // Fetch last 20 reviews
    const reviewsSnap = await adminDb.collection('reviews')
        .where('brewspotId', '==', brewSpotId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

    const reviews = reviewsSnap.docs.map(d => {
        const dData = d.data();
        return `${dData.rating}/5: ${dData.opinion}`;
    });

    if (reviews.length < 1) {
        console.log(`Not enough reviews to summarize for ${brewSpotId} (Count: ${reviews.length})`);
        return null;
    }

    const prompt = `
    Analyze the following reviews for a coffee shop named "${data?.name}".
    
    Reviews:
    ${reviews.join('\n')}
    
    Provide a JSON response with the following structure:
    {
      "summary": "A 2-3 sentence summary of the general vibe, strengths, and weaknesses based on the reviews. Be objective and helpful.",
      "pros": ["Short bullet point 1", "Short bullet point 2", "Short bullet point 3"],
      "cons": ["Short bullet point 1", "Short bullet point 2", "Short bullet point 3"]
    }
    
    Ensure 'pros' and 'cons' have maximum 3 items each. Keep them concise (under 5 words if possible).
    Return ONLY valid JSON.
    `;

    try {
        const result = await executeAISafe<Omit<ReviewSummaryResult, 'generatedAt' | 'version'>>({
            entityId: brewSpotId,
            entityType: 'brewspot', // Using brewspot triggers for summary
            actionType: 'analyze_reviews', // Using existing action type or could add new one
            promptVersion: AI_CONFIG.VERSIONS.REVIEW_SUMMARIZER,
            prompt: prompt,
            triggeredBy: 'admin'
        });

        if (!result.success || !result.data) {
            throw new Error(result.error || "Failed to generate summary");
        }

        const summaryData: ReviewSummaryResult = {
            summary: result.data.summary,
            pros: result.data.pros || [],
            cons: result.data.cons || [],
            generatedAt: new Date().toISOString(),
            version: AI_CONFIG.VERSIONS.REVIEW_SUMMARIZER
        };

        // Save to Firestore
        await spotRef.update({
            ai_summary: summaryData
        });

        return summaryData;

    } catch (error) {
        console.error(`Failed to generate summary for ${brewSpotId}:`, error);
        throw error;
    }
}

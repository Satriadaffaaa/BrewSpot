import { executeAISafe } from '@/lib/ai/aiService';
import { AI_CONFIG } from '@/lib/ai/aiConfig';
import { validateAITags } from '@/lib/ai/aiValidators';
import { mergeAITags } from '@/lib/ai/aiOwnership';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { BrewSpot, AIMeta } from '@/features/brewspot/types';

export async function generateBrewSpotTags(spotId: string, manualTrigger: boolean = false) {
    if (!AI_CONFIG.FEATURES.AUTO_TAGGING) return;

    try {
        const spotRef = doc(db, 'brewspots', spotId);
        const spotSnap = await getDoc(spotRef);

        if (!spotSnap.exists()) return;
        const spot = spotSnap.data() as BrewSpot;

        // Version Check (Skip if already generated for this version, unless manual)
        if (!manualTrigger && spot.aiMeta?.version === AI_CONFIG.VERSIONS.BREWSPOT_TAGGER) {
            return;
        }

        const prompt = `TAGS: Analyze this place: ${spot.name}, ${spot.description}. Facilities: ${spot.facilities.join(', ')}.`;

        const result = await executeAISafe<{ tags: string[], confidence: number }>({
            entityId: spotId,
            entityType: 'brewspot',
            actionType: 'TAG_GENERATION',
            prompt,
            promptVersion: AI_CONFIG.VERSIONS.BREWSPOT_TAGGER,
            triggeredBy: manualTrigger ? 'admin' : 'system'
        });

        if (result.success && result.data) {
            const validTags = validateAITags(result.data.tags);
            if (validTags) {
                const aiMeta: AIMeta = {
                    tags: validTags,
                    version: AI_CONFIG.VERSIONS.BREWSPOT_TAGGER,
                    generatedAt: new Date().toISOString()
                };

                // Merge strategy: Keep user tags, add AI tags only if unique
                // In Phase 4.5 we might just store separate aiMeta for safety
                // But let's assume we want to enrich search, so we might merge carefully if desired.
                // For now, let's ONLY update aiMeta as per strict safety rules.

                await updateDoc(spotRef, {
                    aiMeta: aiMeta
                    // 'tags': mergeAITags(spot.tags, validTags) // OPTIONAL: Enable if we trust AI enough
                });
            }
        }
    } catch (e) {
        console.error("Tag Generation Logic Error", e);
    }
}

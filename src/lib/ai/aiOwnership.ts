import { BrewSpot } from '@/features/brewspot/types';

// Enforce Data Ownership: AI cannot overwrite user content
// AI tags should be stored in 'aiMeta.tags', not the main 'tags' array
// UNLESS explicit admin override is requested (rare)

export function mergeAITags(existingTags: string[], aiTags: string[]): string[] {
    // Phase 4.5 Strategy: Keep AI tags separate in UI or display distinctive label
    // For now, valid AI tags are just suggestions.

    // BUT if we MUST merge (e.g. for search indexing):
    // 1. Keep all user tags
    // 2. Add AI tags that don't exist

    const set = new Set(existingTags.map(t => t.toLowerCase()));

    const newTags = aiTags.filter(t => !set.has(t.toLowerCase()));

    return [...existingTags, ...newTags];
}

export function canOverwriteSummary(spot: BrewSpot): boolean {
    // Only overwrite if existing summary is empty OR was previously AI generated
    // (Check version mismatch logic in caller)
    return !spot.description || !!spot.aiMeta?.summary;
}

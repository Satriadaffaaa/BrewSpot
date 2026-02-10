import { BrewSpot } from '@/features/brewspot/types';

// AI Consistency Guard (Phase 4)
// Prevents unnecessary AI generation

const DATA_VERSION = "v1.0"; // Increment if AI prompts change

export function canGenerateAIMeta(spot: BrewSpot): boolean {
    // 1. Must be approved
    if (spot.status !== 'approved') return false;

    // 2. Must have sufficient data
    if (!spot.description || spot.description.length < 50) return false;
    if (spot.photos.length === 0) return false; // Vision analysis requires photo

    return true;
}

export function shouldRefreshAIMeta(spot: BrewSpot): boolean {
    if (!spot.aiMeta) return true;

    // Check version
    if (spot.aiMeta.version !== DATA_VERSION) return true;

    // Check age (e.g., refresh every 30 days if logic evolves?)
    // For now, consistent version is enough.

    // In real app, check if description changed since generatedAt
    // (requires keeping track of lastDescriptionHash)

    return false;
}

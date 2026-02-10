import { AIMeta } from "@/features/brewspot/types";

export function validateAITags(tags: any): string[] | null {
    if (!Array.isArray(tags)) return null;

    // Filter non-strings and sanitize
    const cleanTags = tags
        .filter(t => typeof t === 'string' && t.length > 2 && t.length < 30) // Length sanity
        .map(t => t.trim().toLowerCase()) // Normalize
        .slice(0, 8); // Max 8 tags

    if (cleanTags.length === 0) return null;
    return cleanTags;
}

export function validateAISummary(summary: any): string | null {
    if (typeof summary !== 'string') return null;

    const clean = summary.trim();
    if (clean.length < 10) return null;
    if (clean.length > 300) return clean.substring(0, 297) + '...';

    return clean;
}

export function validateAISentiment(sentiment: any): AIMeta['sentiment'] | null {
    const valid = ['positive', 'neutral', 'negative'];
    if (valid.includes(sentiment)) return sentiment;
    return null;
}

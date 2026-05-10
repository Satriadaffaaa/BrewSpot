import { BrewSpot } from '@/features/brewspot/types';

export interface SEOMetadata {
    title: string;
    description: string;
    image: string;
}

export function validateSEO(spot: BrewSpot): { isValid: boolean, issues: string[] } {
    const issues: string[] = [];

    if (!spot.name) issues.push("Missing name");
    if (!spot.description) issues.push("Missing description");
    if (!spot.photos || spot.photos.length === 0) issues.push("Missing photos");
    if (!spot.city) issues.push("Missing city");

    return {
        isValid: issues.length === 0,
        issues
    };
}

export function getSafeSEOMetadata(spot: BrewSpot): SEOMetadata {
    const validation = validateSEO(spot);

    // Default / Fallback
    const title = spot.name ? `${spot.name} - Lokali` : 'Local Spot - Lokali';
    const description = spot.description
        ? spot.description.substring(0, 160)
        : `Temukan spot keren di ${spot.name || 'tempat ini'} di ${spot.city || 'sekitarmu'}.`;
    const image = (spot.photos && spot.photos.length > 0)
        ? spot.photos[0]
        : 'https://lokali.id/og-default.jpg'; // Placeholder

    return { title, description, image };
}

import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { BrewSpot } from './types';
import { getLikedBrewSpots } from './api';

// Fallback Chain Implementation
export async function getRecommendedSpots(userId: string): Promise<BrewSpot[]> {
    let spots: BrewSpot[] = [];
    const LIMIT = 5;

    // 0. Get User Context (City, Liked Tags)
    // For Phase 4 without AI, we assume simple tag extraction from liked spots
    const likedSpots = await getLikedBrewSpots(userId);
    const likedTags = new Set<string>();
    let lastCity = '';

    likedSpots.forEach(spot => {
        spot.tags?.forEach(t => likedTags.add(t));
        if (spot.city) lastCity = spot.city;
    });

    const tagArray = Array.from(likedTags).slice(0, 5); // Limit tags query

    // 1. City-based (Highest Priority)
    if (lastCity) {
        const cityQ = query(
            collection(db, 'brewspots'),
            where('city', '==', lastCity),
            where('status', '==', 'approved'),
            limit(LIMIT)
        );
        const snap = await getDocs(cityQ);
        const citySpots = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as BrewSpot))
            .filter(s => s.user_id !== userId); // Don't recommend own spots

        spots = [...spots, ...citySpots];
    }

    if (spots.length >= LIMIT) return deduplicate(spots).slice(0, LIMIT);

    // 2. Tag-based
    if (tagArray.length > 0) {
        // Firestore "array-contains-any" limit is 10
        const tagQ = query(
            collection(db, 'brewspots'),
            where('tags', 'array-contains-any', tagArray),
            where('status', '==', 'approved'),
            limit(LIMIT)
        );
        const snap = await getDocs(tagQ);
        const tagSpots = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as BrewSpot))
            .filter(s => s.user_id !== userId);

        spots = [...spots, ...tagSpots];
    }

    if (deduplicate(spots).length >= LIMIT) return deduplicate(spots).slice(0, LIMIT);

    // 3. Trending (Most liked/reviewed recently) - Simulating with 'rating' or 'reviews_count'
    // Phase 4 simplification: "Top Rated"
    const trendingQ = query(
        collection(db, 'brewspots'),
        where('status', '==', 'approved'),
        orderBy('rating', 'desc'),
        limit(LIMIT)
    );
    const trendingSnap = await getDocs(trendingQ);
    const trendingSpots = trendingSnap.docs.map(d => ({ id: d.id, ...d.data() } as BrewSpot));
    spots = [...spots, ...trendingSpots];

    if (deduplicate(spots).length >= LIMIT) return deduplicate(spots).slice(0, LIMIT);

    // 4. Latest Approved (Ultimate Fallback)
    const latestQ = query(
        collection(db, 'brewspots'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(LIMIT)
    );
    const latestSnap = await getDocs(latestQ);
    const latestSpots = latestSnap.docs.map(d => ({ id: d.id, ...d.data() } as BrewSpot));
    spots = [...spots, ...latestSpots];

    return deduplicate(spots).slice(0, LIMIT);
}

function deduplicate(spots: BrewSpot[]): BrewSpot[] {
    const seen = new Set();
    return spots.filter(spot => {
        const duplicate = seen.has(spot.id);
        seen.add(spot.id);
        return !duplicate;
    });
}

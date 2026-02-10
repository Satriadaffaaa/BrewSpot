import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { BrewSpot } from '@/features/brewspot/types';

export interface SearchLog {
    id: string;
    query: string;
    city: string;
    timestamp: any; // Firestore Timestamp
}

/**
 * Fetch Recent Search Logs
 */
export async function getRecentSearches(limitCount = 20): Promise<SearchLog[]> {
    try {
        const q = query(
            collection(db, 'analytics_searches'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SearchLog));
    } catch (error) {
        console.error("Failed to fetch search logs", error);
        return [];
    }
}

/**
 * Fetch Top Viewed BrewSpots
 */
export async function getTopViewedSpots(limitCount = 5): Promise<BrewSpot[]> {
    try {
        const q = query(
            collection(db, 'brewspots'),
            orderBy('viewsCount', 'desc'),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BrewSpot));
    } catch (error) {
        console.error("Failed to fetch top viewed spots", error);
        return [];
    }
}

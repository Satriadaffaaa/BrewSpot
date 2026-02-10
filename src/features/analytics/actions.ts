'use server'

import { adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * Increment View Count for a BrewSpot
 * Also increments total views for the Creator (Impact Stats)
 */
export async function incrementViewAction(spotId: string, creatorId: string) {
    if (!spotId || !creatorId) return;

    try {
        const batch = adminDb.batch();

        // 1. Increment Spot View
        const spotRef = adminDb.collection('brewspots').doc(spotId);
        batch.update(spotRef, {
            viewsCount: FieldValue.increment(1)
        });

        // 2. Increment Creator Impact Stats
        const userRef = adminDb.collection('users').doc(creatorId);
        batch.update(userRef, {
            'stats.totalViews': FieldValue.increment(1)
        });

        await batch.commit();
        // console.log(`[Analytics] View counted for ${spotId}`);
    } catch (error) {
        console.error('[Analytics] Failed to increment view:', error);
        // Fail silently to not disrupt UX
    }
}

/**
 * Log Search Query for Analytics
 */
export async function logSearchAction(query: string, city?: string) {
    if (!query || query.length < 3) return; // Ignore short queries

    try {
        await adminDb.collection('analytics_searches').add({
            query: query.toLowerCase().trim(),
            city: city || 'all',
            timestamp: FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('[Analytics] Failed to log search:', error);
    }
}

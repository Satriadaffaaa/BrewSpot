import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, getDocs, doc, getDoc, DocumentData } from 'firebase/firestore';
import { Review, BrewSpot } from '@/features/brewspot/types';

/**
 * Global Read Consistency Helpers
 * Ensures all public queries respect:
 * 1. BrewSpot status === 'approved'
 * 2. isHidden !== true (for reviews)
 */

export async function getPublicBrewSpots(filters?: { city?: string, limit?: number }): Promise<BrewSpot[]> {
    const spotsRef = collection(db, 'brewspots');
    let constraints = [];

    // 1. Mandatory Approval Check
    constraints.push(where("status", "==", "approved"));

    // 2. Optional Filters
    if (filters?.city) {
        constraints.push(where("city", "==", filters.city));
    }

    // 3. Default Ordering & Limits
    constraints.push(orderBy("createdAt", "desc"));
    if (filters?.limit) {
        const { limit } = await import('firebase/firestore');
        constraints.push(limit(filters.limit));
    } else {
        const { limit } = await import('firebase/firestore');
        constraints.push(limit(50));
    }

    const q = query(spotsRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BrewSpot));
}

export async function getPublicReviews(brewspotId: string): Promise<Review[]> {
    // 1. Integrity Check: Ensure BrewSpot exists and is approved
    const spotRef = doc(db, 'brewspots', brewspotId);
    const spotSnap = await getDoc(spotRef);

    if (!spotSnap.exists() || spotSnap.data().status !== 'approved') {
        console.warn(`Attempted to fetch reviews for non-approved spot: ${brewspotId}`);
        return []; // Return empty to simulate "no data" for orphans
    }

    // 2. Fetch Reviews
    const q = query(
        collection(db, 'reviews'),
        where('brewspotId', '==', brewspotId),
        orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(q);
    const reviews = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Safe timestamp conversion
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || new Date().toISOString()
    } as Review));

    // 3. Client-side Consistency Filter (Hidden Content & Orphan double-check)
    // We filter `isHidden !== true` to catch both `false` and `undefined` (legacy)
    // We exclude `true` explicitly.
    return reviews.filter(r => r.isHidden !== true);
}

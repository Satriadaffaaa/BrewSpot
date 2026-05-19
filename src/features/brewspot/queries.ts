import { db } from '@/lib/firebase/client'
import {
    collection, getDocs, getDoc, doc, query, where, orderBy, limit
} from 'firebase/firestore'
import { BrewSpot, BrewSpotFilters } from './types'
import { mapToBrewSpot } from './mappers'
import { getPublicBrewSpots } from '@/features/shared/queries'

export async function getBrewSpots(filters?: BrewSpotFilters): Promise<BrewSpot[]> {
    try {
        return await getPublicBrewSpots(filters);
    } catch (error) {
        console.error("Error fetching brewspots:", error);
        return [];
    }
}

export async function getBrewSpotById(id: string): Promise<BrewSpot> {
    const docRef = doc(db, 'brewspots', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        throw new Error('Spot not found');
    }

    return mapToBrewSpot(snap.id, snap.data());
}

export async function getBrewSpotsByUser(userId: string): Promise<BrewSpot[]> {
    const spotsRef = collection(db, 'brewspots');
    const q = query(spotsRef, where("createdBy", "==", userId), orderBy("createdAt", "desc"));

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => mapToBrewSpot(d.id, d.data()));
    } catch (error) {
        console.error("Error fetching user brewspots:", error);
        throw error;
    }
}

export async function getLikedBrewSpots(userId: string): Promise<BrewSpot[]> {
    const likesRef = collection(db, 'likes');
    const qRaw = query(likesRef, where("userId", "==", userId));

    try {
        const likesSnap = await getDocs(qRaw);
        const brewspotIds = likesSnap.docs.map(d => d.data().brewspotId);

        if (brewspotIds.length === 0) return [];

        const spotPromises = brewspotIds.map(async (id: string) => {
            try {
                const docRef = doc(db, 'brewspots', id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    return mapToBrewSpot(snap.id, snap.data());
                }
                return null;
            } catch (error) {
                return null;
            }
        });

        const results = await Promise.all(spotPromises);
        return results.filter((spot): spot is BrewSpot => spot !== null);

    } catch (error) {
        console.error("Error fetching liked spots:", error);
        return [];
    }
}

export async function getTrendingBrewSpots(
    limitCount: number = 5,
    by: 'checkins' | 'views' = 'checkins'
): Promise<BrewSpot[]> {
    try {
        const spotsRef = collection(db, 'brewspots');
        const orderField = by === 'views' ? 'viewsCount' : 'totalCheckIns';

        const q = query(
            spotsRef,
            where('status', '==', 'approved'),
            orderBy(orderField, 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => mapToBrewSpot(doc.id, doc.data()));
    } catch (error) {
        console.error(`Error fetching trending brewspots by ${by}:`, error);
        return [];
    }
}

export async function getOwnedSpots(ownerId: string): Promise<BrewSpot[]> {
    const spotsRef = collection(db, 'brewspots');
    const q = query(spotsRef, where("ownerId", "==", ownerId), orderBy("createdAt", "desc"));

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => mapToBrewSpot(d.id, d.data()));
    } catch (error) {
        console.error("Error fetching owned brewspots:", error);
        return [];
    }
}

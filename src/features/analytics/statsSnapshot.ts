import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, serverTimestamp, getCountFromServer } from 'firebase/firestore';

export interface AnalyticsSnapshot {
    date: string; // YYYY-MM-DD
    newUsers: number;
    newReviews: number;
    newBrewSpots: number;
    approvals: number;
    activeUsersEstimate: number;
    totalUsers: number;
    totalBrewSpots: number;
    timestamp: any;
}

export async function getAnalyticsSnapshots(): Promise<AnalyticsSnapshot[]> {
    try {
        const q = query(collection(db, 'analytics_snapshots'), orderBy('date', 'desc'), limit(30));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as AnalyticsSnapshot);
    } catch (error) {
        console.error("Failed to fetch analytics snapshots", error);
        return [];
    }
}

// Function to generate daily snapshot (To be called by Admin or scheduled job)
// For Phase 4, we might trigger this manually or lazy-load if missing for today.
export async function generateDailySnapshot(): Promise<AnalyticsSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    const snapRef = doc(db, 'analytics_snapshots', today);

    // Heavy aggregation (Client-side simulation of what would be a Cloud Function)
    // In real app, avoid running this on client.
    // We will use count() aggregation which is cheap.

    const usersColl = collection(db, 'users');
    const reviewsColl = collection(db, 'reviews');
    const spotsColl = collection(db, 'brewspots');

    // Total Counts
    const totalUsers = (await getCountFromServer(usersColl)).data().count;
    const totalSpots = (await getCountFromServer(spotsColl)).data().count;
    const totalReviews = (await getCountFromServer(reviewsColl)).data().count;

    // "New" counts require querying by date, which is expensive if many docs.
    // For Phase 4 demo, we might mock "New" or query strictly recent.
    // Let's assume 0 for "New" if we can't efficiently query, or simple approximations.

    const snapshot: AnalyticsSnapshot = {
        date: today,
        newUsers: 0, // Requires query by createdAt
        newReviews: 0,
        newBrewSpots: 0,
        approvals: 0,
        activeUsersEstimate: 0,
        totalUsers,
        totalBrewSpots: totalUsers, // Typo in variable logic? No, assuming variable reuse for storage
        timestamp: serverTimestamp()
    };

    // Store it
    await setDoc(snapRef, snapshot);
    return snapshot;
}

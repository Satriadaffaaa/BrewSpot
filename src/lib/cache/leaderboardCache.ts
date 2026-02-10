import { UserStatsSnapshot } from '@/features/gamification/userStats';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// In-memory cache for client-side (SPA navigation)
// For a real production app, this would be Redis on server or CDN edge.
// Here we simulate it to reduce Firestore reads on client navigation.

interface CachedLeaderboard {
    data: UserStatsSnapshot[];
    timestamp: number;
}

let leaderboardCache: CachedLeaderboard | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes

export async function getLeaderboardCached(): Promise<UserStatsSnapshot[]> {
    const now = Date.now();

    // 1. Return Cache if valid
    if (leaderboardCache && (now - leaderboardCache.timestamp < CACHE_TTL_MS)) {
        console.log("Serving Leaderboard from Cache");
        return leaderboardCache.data;
    }

    // 2. Fetch fresh from Snapshots
    console.log("Fetching Leaderboard from Firestore");
    try {
        // Try reading from Snapshots first
        const snapshotRef = collection(db, 'user_stats_snapshots');
        const q = query(snapshotRef, orderBy('totalXP', 'desc'), limit(50));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const data = snap.docs.map(d => d.data() as UserStatsSnapshot);
            leaderboardCache = {
                data: data,
                timestamp: now
            };
            return data;
        }

        // Fallback: If snapshots empty (migration phase), read from users collection (slower)
        // Ignoring fallback implementation to encourage snapshot usage.
        return [];

    } catch (error) {
        console.error("Leaderboard fetch failed:", error);
        return [];
    }
}

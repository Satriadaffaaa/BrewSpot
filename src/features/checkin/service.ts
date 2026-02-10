import {
    collection,
    doc,
    runTransaction,
    Timestamp,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    getDoc,
    setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { CheckIn, BrewSpotVisitorStats, UserVisitStats } from "./types";

export const CHECKIN_COOLDOWN_HOURS = 24;

/**
 * Checks in a user to a BrewSpot.
 * Enforces a 24-hour cooldown per user per location.
 */
export const checkIn = async (userId: string, brewSpotId: string): Promise<{ success: boolean; message: string }> => {
    if (!userId || !brewSpotId) return { success: false, message: "Invalid user or brewspot ID" };

    try {
        await runTransaction(db, async (transaction) => {
            // 1. READS (Must come before writes)
            const userStatsRef = doc(db, `users/${userId}/stats/visits`);
            const spotStatsRef = doc(db, `brewspots/${brewSpotId}/stats/visitors`);
            const userRef = doc(db, `users/${userId}`); // Reference to main user doc

            const [userStatsDoc, spotStatsDoc, userDoc] = await Promise.all([
                transaction.get(userStatsRef),
                transaction.get(spotStatsRef),
                transaction.get(userRef)
            ]);

            // 2. Logic & Validation
            let lastVisitTime = 0;
            let currentStats = userStatsDoc.data() as UserVisitStats | undefined;

            if (currentStats && currentStats.topSpots) {
                const spotStat = currentStats.topSpots.find(s => s.brewSpotId === brewSpotId);
                if (spotStat) {
                    lastVisitTime = spotStat.lastVisit.toMillis();
                }
            }

            const now = Date.now();
            const cooldown = CHECKIN_COOLDOWN_HOURS * 60 * 60 * 1000;

            if (now - lastVisitTime < cooldown) {
                throw new Error("Cooling down");
            }

            // 3. WRITES

            // Create CheckIn Document
            const checkInRef = doc(collection(db, "check_ins"));
            const newCheckIn: CheckIn = {
                id: checkInRef.id,
                userId,
                brewSpotId,
                timestamp: Timestamp.now()
            };
            transaction.set(checkInRef, newCheckIn);

            // Update User Stats (Subcollection)
            const newUserStats: UserVisitStats = currentStats || { totalVisits: 0, visitHistory: {}, topSpots: [] };
            newUserStats.totalVisits += 1;
            newUserStats.visitHistory[brewSpotId] = (newUserStats.visitHistory[brewSpotId] || 0) + 1;

            const spotIndex = newUserStats.topSpots.findIndex(s => s.brewSpotId === brewSpotId);
            if (spotIndex >= 0) {
                newUserStats.topSpots[spotIndex].count += 1;
                newUserStats.topSpots[spotIndex].lastVisit = newCheckIn.timestamp;
            } else {
                newUserStats.topSpots.push({
                    brewSpotId,
                    count: 1,
                    lastVisit: newCheckIn.timestamp
                });
            }
            newUserStats.topSpots.sort((a, b) => b.count - a.count);
            transaction.set(userStatsRef, newUserStats);

            // Update Main User Document Stats (For Leaderboard)
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentTotalCheckIns = userData.stats?.totalCheckIns || 0;
                transaction.update(userRef, {
                    'stats.totalCheckIns': currentTotalCheckIns + 1
                });
            }


            // Update BrewSpot Stats (Subcollection)
            let currentSpotStats = spotStatsDoc.data() as BrewSpotVisitorStats | undefined;
            const newSpotStats: BrewSpotVisitorStats = currentSpotStats || { totalCheckIns: 0, visitorHistory: {}, topVisitors: [] };

            newSpotStats.totalCheckIns += 1;
            newSpotStats.visitorHistory[userId] = (newSpotStats.visitorHistory[userId] || 0) + 1;

            const visitorIndex = newSpotStats.topVisitors.findIndex(v => v.userId === userId);
            if (visitorIndex >= 0) {
                newSpotStats.topVisitors[visitorIndex].count += 1;
                newSpotStats.topVisitors[visitorIndex].lastVisit = newCheckIn.timestamp;
            } else {
                newSpotStats.topVisitors.push({
                    userId,
                    count: 1,
                    lastVisit: newCheckIn.timestamp
                });
            }
            newSpotStats.topVisitors.sort((a, b) => b.count - a.count);

            if (newSpotStats.topVisitors.length > 20) {
                newSpotStats.topVisitors = newSpotStats.topVisitors.slice(0, 20);
            }

            transaction.set(spotStatsRef, newSpotStats);

            // Update Main BrewSpot Document (For Trending Feature)
            const brewSpotRef = doc(db, `brewspots/${brewSpotId}`);
            transaction.update(brewSpotRef, {
                totalCheckIns: (currentSpotStats?.totalCheckIns || 0) + 1
            });
        });

        return { success: true, message: "Check-in successful!" };

    } catch (e: any) {
        if (e.message === "Cooling down") {
            return { success: false, message: `You can only check in once every ${CHECKIN_COOLDOWN_HOURS} hours.` };
        }
        console.error("Check-in error:", e);
        return { success: false, message: "Failed to check in." };
    }
};

export const getTopVisitors = async (brewSpotId: string) => {
    try {
        const docRef = doc(db, `brewspots/${brewSpotId}/stats/visitors`);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data() as BrewSpotVisitorStats;
        }
        return null;
    } catch (error) {
        console.error("Error fetching top visitors:", error);
        return null;
    }
};

export const getUserVisitHistory = async (userId: string) => {
    try {
        const docRef = doc(db, `users/${userId}/stats/visits`);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data() as UserVisitStats;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user visit history:", error);
        return null;
    }
}

export const getGlobalLeaderboard = async (limitCount: number = 50) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            orderBy('stats.totalCheckIns', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching global leaderboard:", error);
        return [];
    }
}

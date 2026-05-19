import {
    collection,
    doc,
    query,
    getDocs,
    limit,
    orderBy,
    getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { BrewSpotVisitorStats, UserVisitStats } from "./types";
import { mapToBrewSpotVisitorStats, mapToUserVisitStats, mapToLeaderboardEntry } from "./mappers";

export const getTopVisitors = async (brewSpotId: string): Promise<BrewSpotVisitorStats | null> => {
    try {
        const docRef = doc(db, `brewspots/${brewSpotId}/stats/visitors`);
        const snapshot = await getDoc(docRef);
        return mapToBrewSpotVisitorStats(snapshot);
    } catch (error) {
        console.error("Error fetching top visitors:", error);
        return null;
    }
};

export const getUserVisitHistory = async (userId: string): Promise<UserVisitStats | null> => {
    try {
        const docRef = doc(db, `users/${userId}/stats/visits`);
        const snapshot = await getDoc(docRef);
        return mapToUserVisitStats(snapshot);
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
        return snapshot.docs.map(mapToLeaderboardEntry);
    } catch (error) {
        console.error("Error fetching global leaderboard:", error);
        return [];
    }
}

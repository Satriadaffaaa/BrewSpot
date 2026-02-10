import { Timestamp } from "firebase/firestore";

export interface CheckIn {
    id: string;
    userId: string;
    brewSpotId: string;
    timestamp: Timestamp;
}

// Subcollection: users/{userId}/stats/visits
// Document ID: 'summary' or generic single doc
export interface UserVisitStats {
    totalVisits: number;
    // Map of brewSpotId -> visit count
    visitHistory: Record<string, number>;
    // Simplified for MVP: Array of { brewSpotId, count, lastVisit } for easy sorting
    topSpots: Array<{
        brewSpotId: string;
        count: number;
        lastVisit: Timestamp;
    }>;
}

// Subcollection: brewspots/{brewSpotId}/stats/visitors
export interface BrewSpotVisitorStats {
    totalCheckIns: number;
    // Map of userId -> visit count
    visitorHistory: Record<string, number>;
    // Simplified for MVP: Array of { userId, count, lastVisit } for easy sorting
    topVisitors: Array<{
        userId: string;
        count: number;
        lastVisit: Timestamp;
    }>;
}

import { DocumentData, QueryDocumentSnapshot, DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { CheckIn, UserVisitStats, BrewSpotVisitorStats } from './types';

export function mapToCheckIn(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): CheckIn {
    const data = doc.data()!;
    return {
        id: doc.id,
        userId: data.userId,
        brewSpotId: data.brewSpotId,
        timestamp: data.timestamp,
    };
}

export function mapToUserVisitStats(doc: DocumentSnapshot<DocumentData>): UserVisitStats | null {
    if (!doc.exists()) return null;
    const data = doc.data()!;
    return {
        totalVisits: data.totalVisits || 0,
        visitHistory: data.visitHistory || {},
        topSpots: (data.topSpots || []).map((s: { brewSpotId: string; count: number; lastVisit: Timestamp }) => ({
            brewSpotId: s.brewSpotId,
            count: s.count,
            lastVisit: s.lastVisit,
        })),
    };
}

export function mapToBrewSpotVisitorStats(doc: DocumentSnapshot<DocumentData>): BrewSpotVisitorStats | null {
    if (!doc.exists()) return null;
    const data = doc.data()!;
    return {
        totalCheckIns: data.totalCheckIns || 0,
        visitorHistory: data.visitorHistory || {},
        topVisitors: (data.topVisitors || []).map((v: { userId: string; count: number; lastVisit: Timestamp }) => ({
            userId: v.userId,
            count: v.count,
            lastVisit: v.lastVisit,
        })),
    };
}

export function mapToLeaderboardEntry(doc: QueryDocumentSnapshot<DocumentData>) {
    const data = doc.data();
    return {
        uid: doc.id,
        ...data,
    };
}

import { db } from '@/lib/firebase/client';
import {
    collection, doc, getDoc, getDocs, query, orderBy, limit
} from 'firebase/firestore';
import { UserProfile } from './types';
import { mapToUserProfile } from './mappers';

/**
 * Calculates user level based on XP.
 */
export function calculateLevel(xp: number): number {
    // Level 1: 0-99
    // Level 2: 100-249
    // Level 3: 250-499
    // Level 4: 500+
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    // Level 5+ : Every 500 XP
    return 4 + Math.floor((xp - 500) / 500);
}

/**
 * Fetches the leaderboard sorted by XP.
 */
export async function getLeaderboard(): Promise<UserProfile[]> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            orderBy('xp', 'desc'),
            limit(50)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => mapToUserProfile(doc));
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return [];
    }
}

/**
 * Fetches a user profile by ID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) return null;
        
        return mapToUserProfile(snap);
    } catch (error) {
        console.error(`Failed to fetch user profile for ${userId}:`, error);
        return null;
    }
}

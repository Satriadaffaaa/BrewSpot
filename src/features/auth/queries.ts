import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { mapToUserProfile } from './mappers';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return mapToUserProfile({ uid: userSnap.id, ...userSnap.data() });
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

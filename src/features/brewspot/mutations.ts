import { db, auth } from '@/lib/firebase/client'
import {
    collection, getDocs, getDoc, doc, addDoc, query, where,
    Timestamp, updateDoc, deleteDoc, setDoc, serverTimestamp
} from 'firebase/firestore'
import { AddBrewSpotInput, BrewSpot } from './types'
import { awardXP } from '@/features/gamification/api'
import { XP_VALUES } from '@/features/gamification/types'
import { mapToBrewSpot } from './mappers'

export async function createBrewSpot(input: AddBrewSpotInput): Promise<BrewSpot> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User must be authenticated to add a spot');
    }

    let status = 'pending';
    let autoApproved = false;
    let approvedBy = null;
    let isOfficial = false;
    let verificationStatus: 'unclaimed' | 'pending' | 'verified' = 'unclaimed';
    let ownerId = null;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        const isSafeAccount = !userData.accountStatus || userData.accountStatus === 'active';

        // Check if Business Owner (Automatic Verification)
        if (userData.role === 'owner' && isSafeAccount) {
            status = 'approved';
            autoApproved = true;
            approvedBy = 'system';
            isOfficial = true;
            verificationStatus = 'verified';
            ownerId = user.uid;
        } 
        // Check if Trusted Contributor (Automatic Approval only)
        else if (userData.isContributor && isSafeAccount) {
            status = 'approved';
            autoApproved = true;
            approvedBy = 'system';
        }
    }

    const data: any = {
        name: input.name,
        address: input.address,
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
        priceRange: input.price_range,
        facilities: input.facilities,
        photos: input.photos,
        description: input.description,
        tags: input.tags,
        category: input.category || 'cafe',
        subcategory: input.subcategory || null,
        menuUrl: input.menuUrl || null,
        imageUrl: input.photos[0] || null,
        videoUrl: input.videoUrl || null,
        weekly_hours: input.weekly_hours || null,
        createdBy: user.uid,
        status: status,
        autoApproved: autoApproved,
        approvedBy: approvedBy,
        createdAt: Timestamp.now(),
        authorName: user.displayName || userSnap.data()?.name || 'Anonymous',
        authorAvatar: user.photoURL || userSnap.data()?.photoURL || null,
        authorIsContributor: userSnap.data()?.isContributor || false,
        // Phase 10: Ownership & Verification
        isOfficial,
        verificationStatus,
        ownerId
    };

    const duplicateQuery = query(
        collection(db, 'brewspots'),
        where('address', '==', input.address),
        where('status', '==', 'approved')
    );
    const duplicateSnap = await getDocs(duplicateQuery);
    if (!duplicateSnap.empty) {
        throw new Error('A spot with this exact address already exists.');
    }

    const docRef = await addDoc(collection(db, 'brewspots'), data);

    if (status === 'approved') {
        await awardXP(user.uid, XP_VALUES.APPROVE_SPOT, 'approve_spot', docRef.id);
    }

    const currentSubmitted = userSnap.data()?.stats?.brewspotSubmitted || 0;
    const currentApproved = userSnap.data()?.stats?.brewspotApproved || 0;

    await updateDoc(userDocRef, {
        'stats.brewspotSubmitted': currentSubmitted + 1,
        'stats.brewspotApproved': status === 'approved' ? currentApproved + 1 : currentApproved
    });

    return mapToBrewSpot(docRef.id, data);
}

export async function updateBrewSpot(id: string, data: Partial<AddBrewSpotInput>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');

    const docRef = doc(db, 'brewspots', id);

    const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
    };

    if (data.price_range) {
        updateData.priceRange = data.price_range;
        delete updateData.price_range;
    }

    // Strip sensitive fields that should only be modified by Admin or via official claims
    delete updateData.createdBy;
    delete updateData.status;
    delete updateData.autoApproved;
    delete updateData.approvedBy;
    delete updateData.authorName;
    delete updateData.ownerId;
    delete updateData.isOfficial;
    delete updateData.verificationStatus;

    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            updateData[key] = null;
        }
    });

    await updateDoc(docRef, updateData);
}

export async function deleteBrewSpot(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');

    const docRef = doc(db, 'brewspots', id);
    await deleteDoc(docRef);
}

export async function toggleLike(brewspotId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const likeRef = doc(db, 'likes', `${user.uid}_${brewspotId}`);
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        return false;
    } else {
        await setDoc(likeRef, {
            userId: user.uid,
            brewspotId: brewspotId,
            createdAt: serverTimestamp()
        });

        await awardXP(user.uid, XP_VALUES.LIKE, 'like', brewspotId);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentLikes = userData?.stats?.totalLikesGiven || 0;

            await updateDoc(userRef, {
                'stats.totalLikesGiven': currentLikes + 1
            });
        }

        return true;
    }
}

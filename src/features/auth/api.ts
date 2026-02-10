import { db, auth } from '@/lib/firebase/client';
import { doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export interface UpdateProfileInput {
    displayName?: string;
    photoFile?: File;
}

export async function updateUserProfile(uid: string, input: UpdateProfileInput): Promise<void> {
    console.log("Starting updateUserProfile", { uid, input });
    const user = auth.currentUser;
    if (!user || user.uid !== uid) throw new Error("Unauthorized");

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    console.log("Fetched user data", userData);

    const updates: any = {};

    // 1. Handle Photo Upload
    if (input.photoFile) {
        console.log("Uploading photo to Cloudinary...");
        try {
            // Use Cloudinary for storage
            const downloadURL = await uploadToCloudinary(input.photoFile, `users/${uid}`);
            console.log("Photo uploaded to Cloudinary, URL:", downloadURL);

            updates.photoURL = downloadURL;

            // Update Auth Profile (so reload reflects it)
            await updateProfile(user, { photoURL: downloadURL });
            console.log("Auth profile photo updated");
        } catch (error) {
            console.error("Failed to upload photo to Cloudinary", error);
            throw new Error("Failed to upload profile photo");
        }
    }

    // 2. Handle Display Name
    if (input.displayName && input.displayName !== userData?.displayName) {
        console.log("Updating display name...");
        // Enforce 3-day limit check logic (Client-side pre-check is good, but DB rules enforce strictness)
        const lastChange = userData?.lastUsernameChange?.toDate();
        if (lastChange) {
            const daysSince = (Date.now() - lastChange.getTime()) / (1000 * 3600 * 24);
            if (daysSince < 3) {
                throw new Error("You can only change your username once every 3 days.");
            }
        }

        updates.displayName = input.displayName;
        updates.lastUsernameChange = Timestamp.now();

        // Update Auth Profile
        await updateProfile(user, { displayName: input.displayName });
        console.log("Auth profile name updated");
    }

    // 3. Update Firestore
    if (Object.keys(updates).length > 0) {
        console.log("Updating Firestore doc...", updates);
        updates.updatedAt = Timestamp.now();
        await updateDoc(userRef, updates);
        console.log("Firestore doc updated");
    } else {
        console.log("No updates to apply");
    }
}

export async function getUserProfile(uid: string) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { uid: userSnap.id, ...userSnap.data() } as any;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

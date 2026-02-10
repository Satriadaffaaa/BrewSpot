
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with defensive check for build environments
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

try {
    if (getApps().length > 0) {
        app = getApp();
    } else {
        // Only initialize if we have a config, or allow it to fail gracefully
        // If apiKey is missing (e.g. build time), initializeApp might throw 'auth/invalid-api-key' later
        // We can pass the config as is, but if it fails, we catch it.
        app = initializeApp(firebaseConfig);
    }

    // Explicitly cast or check if app is valid before getting services
    // but getAuth throws if app is not valid. 
    // If initializeApp succeeded, app is valid.
    if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    }
} catch (error) {
    console.warn("Firebase initialization failed (likely due to missing env vars during build):", error);
}

export { app, auth, db, storage };

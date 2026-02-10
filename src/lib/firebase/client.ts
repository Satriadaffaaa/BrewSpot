
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with defensive check for build environments
let app;
let auth;
let db;
let storage;

try {
    if (getApps().length > 0) {
        app = getApp();
    } else {
        // Only initialize if we have a config, or allow it to fail gracefully
        // If apiKey is missing (e.g. build time), initializeApp might throw 'auth/invalid-api-key' later
        // We can pass the config as is, but if it fails, we catch it.
        app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.warn("Firebase initialization failed (likely due to missing env vars during build):", error);
    // We don't export dummy objects here to avoid type masking issues, 
    // but the build should at least pass the import stage if logic allows.
    // However, exports 'auth', 'db' etc will be undefined if this fails.
    // To prevent "cannot read property of undefined" in other files, we should probably check existence there 
    // OR create a dummy mock for the build.
}

export { app, auth, db, storage };

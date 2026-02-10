
import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let app;

if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        app = initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        // Fallback or warning if keys are missing in dev
        console.warn("Firebase Admin keys missing, some server features may fail.");
        app = initializeApp();
    }
} else {
    app = getApp();
}

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };

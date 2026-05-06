import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Multi-mode configuration for both AI Studio and external deployments (Vercel)
let firebaseConfig: any = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// If environment variables are not set (e.g. while developing in AI Studio),
// try to load from the generated config file.
if (!firebaseConfig.apiKey) {
  try {
    // @ts-ignore - This file is created by AI Studio in the local environment
    const configPath = '../firebase-applet-config.json';
    firebaseConfig = await import(/* @vite-ignore */ configPath).then(m => m.default);
  } catch (e) {
    // Fallback failed
  }
}

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase configuration is missing. If you are on Vercel, please add the VITE_FIREBASE_* environment variables to your project settings.");
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;

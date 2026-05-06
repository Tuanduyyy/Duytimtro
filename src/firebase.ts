import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Consolidated configuration
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Hardcoded fallbacks if environment variables are not properly injected or contain placeholders
if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.startsWith('AIza') || firebaseConfig.apiKey.includes('VITE_FIREBASE')) {
  firebaseConfig.projectId = "gen-lang-client-0133795823";
  firebaseConfig.appId = "1:73964350869:web:9ada449632f7e756e11a9c";
  firebaseConfig.apiKey = "AIzaSyAVO0mkFJocuwSXC94fBCooowCZcG2vApE";
  firebaseConfig.authDomain = "gen-lang-client-0133795823.firebaseapp.com";
  firebaseConfig.firestoreDatabaseId = "ai-studio-8e979eeb-230e-48f0-92d4-eee55104b335";
  firebaseConfig.storageBucket = "gen-lang-client-0133795823.firebasestorage.app";
  firebaseConfig.messagingSenderId = "73964350869";
  firebaseConfig.measurementId = "";
}

if (!firebaseConfig.apiKey) {
  console.error("Firebase configuration missing. Please ensure project setup is complete.");
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;

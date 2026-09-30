// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once (Next.js hot reload safe)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Connect to Emulators in local dev ───────────────────────────────────────
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_EMULATOR === "true"
) {
  const globalWithEmulators = window as typeof window & {
    _firebaseEmulatorsConnected?: boolean;
  };

  if (!globalWithEmulators._firebaseEmulatorsConnected) {
    globalWithEmulators._firebaseEmulatorsConnected = true;
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      console.log("✅ Firebase Local Emulators connected successfully");
    } catch (e) {
      console.warn("⚠️ Emulator connection notice:", e);
    }
  }
}

// src/firebaseConfig.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore"; // 💡 TAMBAHKAN INI
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbVGFDvdE5rKYR8FsSncltZOt77oxZPZM",
  authDomain: "courtly-web.firebaseapp.com",
  projectId: "courtly-web",
  storageBucket: "courtly-web.firebasestorage.app",
  messagingSenderId: "23712264842",
  appId: "1:23712264842:web:05d36ee23e8630fab37373",
  measurementId: "G-TTHQPFNZHS"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
let analytics: any;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Get the authentication instance
const auth: Auth = getAuth(app);

// Get the Firestore instance
const db: Firestore = getFirestore(app); // 💡 INISIALISASI FIRESTORE DI SINI

export { app, auth, db, analytics }; // 💡 EKSPOR 'db'
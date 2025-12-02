import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// It's recommended to store this in environment variables
// For this example, we'll keep it here for simplicity
const firebaseConfig = {
  apiKey: "AIzaSyC2IJqfR0ChvNMJX3g0Y58QsKZtSIGyRns",
  authDomain: "noteapp-4af21.firebaseapp.com",
  projectId: "noteapp-4af21",
  storageBucket: "noteapp-4af21.firebasestorage.app",
  messagingSenderId: "1034829923148",
  appId: "1:1034829923148:web:2abf5cef9867cc5230c5e9",
  measurementId: "G-EZ2WR9DJTQ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
// hello
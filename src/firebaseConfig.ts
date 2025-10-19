import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA6WWG9yE-YNhr_dLkEh5hqTFjhRShYE5g",
  authDomain: "cashflow365.firebaseapp.com",
  databaseURL: "https://cashflow365-default-rtdb.firebaseio.com",
  projectId: "cashflow365",
  storageBucket: "cashflow365.appspot.com",
  messagingSenderId: "146022358921",
  appId: "1:146022358921:web:825da29626b2bfc02fcb58",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth (web only)
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Realtime Database
const db = getDatabase(app);

export { auth, db, app };

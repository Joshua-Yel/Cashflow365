import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA6WWG9yE-YNhr_dLkEh5hqTFjhRShYE5g",
  authDomain: "cashflow365.firebaseapp.com",
  // IMPORTANT: You need to add your Realtime Database URL here from the Firebase Console
  // It usually looks like: https://<PROJECT_ID>-default-rtdb.firebaseio.com
  databaseURL: "https://cashflow365-default-rtdb.firebaseio.com",
  projectId: "cashflow365",
  storageBucket: "cashflow365.firebasestorage.app",
  messagingSenderId: "146022358921",
  appId: "1:146022358921:web:825da29626b2bfc02fcb58",
};

// Initialize the Firebase app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth only once
let auth;
try {
  auth = getAuth(app); // Will throw if not already initialized
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

// Initialize Realtime Database
const db = getDatabase(app);

export { auth, db };

// import { initializeApp, getApps, getApp } from "firebase/app";
// import {
//   getAuth,
//   initializeAuth,
//   getReactNativePersistence,
// } from "firebase/auth";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyA6WWG9yE-YNhr_dLkEh5hqTFjhRShYE5g",
//   authDomain: "cashflow365.firebaseapp.com",
//   projectId: "cashflow365",
//   storageBucket: "cashflow365.firebasestorage.app",
//   messagingSenderId: "146022358921",
//   appId: "1:146022358921:web:825da29626b2bfc02fcb58",
// };

// // Initialize the Firebase app only once
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // Initialize Auth only once
// let auth;
// try {
//   auth = getAuth(app); // Will throw if not already initialized
// } catch (e) {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage),
//   });
// }

// export { auth };

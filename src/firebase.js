// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// `https://firebase.google.com/docs/web/setup#available-libraries`

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiOfu6brLqj0eCGhzOLTh3t7Wowmyu-wA",
  authDomain: "funquiz2k25.firebaseapp.com",
  projectId: "funquiz2k25",
  storageBucket: "funquiz2k25.firebasestorage.app",
  messagingSenderId: "585481842215",
  appId: "1:585481842215:web:ce7125a7e99fbbe8d0e802",
  measurementId: "G-T3CE39JPKS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

try {
  analytics = getAnalytics(app);
} catch {
  analytics = undefined;
}

export { app, analytics, firebaseConfig };


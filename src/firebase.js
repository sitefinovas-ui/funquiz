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
const isLocalHost = typeof window !== "undefined" && (() => {
  const host = window.location.hostname || "";
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
  if (host.startsWith("192.168.") || host.startsWith("10.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
})();
const shouldInitAnalytics = import.meta.env.PROD && !isLocalHost;

if (shouldInitAnalytics) {
  try {
    analytics = getAnalytics(app);
  } catch {
    analytics = undefined;
  }
} else {
  analytics = undefined;
}

export { app, analytics, firebaseConfig };

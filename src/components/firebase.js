// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsZP4YitTCoKxvVnSEjPSRtp5ABsX7gvc",
  authDomain: "satstreak-ce6b7.firebaseapp.com",
  projectId: "satstreak-ce6b7",
  storageBucket: "satstreak-ce6b7.firebasestorage.app",
  messagingSenderId: "144699148765",
  appId: "1:144699148765:web:6fb23622058ddf6c42ce34",
  measurementId: "G-SVX0Y01LGE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
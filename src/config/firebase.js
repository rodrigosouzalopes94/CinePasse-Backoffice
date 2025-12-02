import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyAtsPRF3LpBHxSJ86y6jwJDIdfxBsGdeJ0',
  appId: '1:657425286496:web:6f96ca895db0f1bf9cca05',
  messagingSenderId: '657425286496',
  projectId: 'cinepasse-51665',
  authDomain: 'cinepasse-51665.firebaseapp.com',
  storageBucket: 'cinepasse-51665.firebasestorage.app',
  measurementId: 'G-4W5QB205TQ',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
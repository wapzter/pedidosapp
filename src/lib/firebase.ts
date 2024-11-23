import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD95oJkYGsbzwZSMHFp3mdbUtkMJQMR124",
  authDomain: "fmacy-9a354.firebaseapp.com",
  projectId: "fmacy-9a354",
  storageBucket: "fmacy-9a354.firebasestorage.app",
  messagingSenderId: "187632516527",
  appId: "1:187632516527:web:36e81153ffc1c8ef4b435a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
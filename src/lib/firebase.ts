import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyColBKwRYLEXgAYphqsPq3S5QBUGZChyx8",
  authDomain: "instamocks-ai.firebaseapp.com",
  projectId: "instamocks-ai",
  storageBucket: "instamocks-ai.firebasestorage.app",
  messagingSenderId: "728064964847",
  appId: "1:728064964847:web:63f483851313d8aa9dc31a"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

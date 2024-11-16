// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence  } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
// import { collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGM5-72bHSQEEp1ucP2Yum3v9tuaDs2QI",
  authDomain: "collaborative-document-editor.firebaseapp.com",
  projectId: "collaborative-document-editor",
  storageBucket: "collaborative-document-editor.firebasestorage.app",
  messagingSenderId: "943448605226",
  appId: "1:943448605226:web:4d6b27f9a65664d334b953",
  measurementId: "G-HGMRSWGV70"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setPersistence(auth, browserLocalPersistence);
const provider = new GoogleAuthProvider();

const signInWithGoogle = () => signInWithPopup(auth, provider);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == "failed-precondition") {
      console.log("Offline persistence failed due to multiple tabs open");
    } else if (err.code == "unimplemented") {
      console.log("Offline persistence is not available in this environment");
    }
  });

export { auth, signInWithGoogle, db };

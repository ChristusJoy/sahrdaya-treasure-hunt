// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhdidF0NFAe94QZe3d_Wkt2c0hLuRhZ4U",
  authDomain: "sahrdaya-treasure-hunt.firebaseapp.com",
  projectId: "sahrdaya-treasure-hunt",
  storageBucket: "sahrdaya-treasure-hunt.firebasestorage.app",
  messagingSenderId: "203013300571",
  appId: "1:203013300571:web:800e6ad442826a33103a7e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
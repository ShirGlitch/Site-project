// ייבוא הכלים של פיירבייס מגוגל
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// תעודת הזהות של הפרויקט
const firebaseConfig = {
  apiKey: "AIzaSyAGTQRYzvT5A2g_23-5msvHXmNJQei3__4",
  authDomain: "site-project-5cdc3.firebaseapp.com",
  projectId: "site-project-5cdc3",
  storageBucket: "site-project-5cdc3.firebasestorage.app",
  messagingSenderId: "488100302464",
  appId: "1:488100302464:web:d3672f761f65f4ddd0e065",
  measurementId: "G-TLG3QP5P16"
};

// הפעלת פיירבייס
const app = initializeApp(firebaseConfig);

// הפעלת מסד הנתונים (db) ומערכת המשתמשים (auth)
export const db = getFirestore(app);
export const auth = getAuth(app);
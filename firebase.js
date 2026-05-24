// ייבוא הפונקציה שאחראית על הפעלת החיבור ל-Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
// ייבוא הפונקציה שמאפשרת גישה למסד הנתונים (Firestore)
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
// ייבוא הפונקציה שמאפשרת גישה למערכת אימות המשתמשים
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// הגדרת אובייקט עם כל פרטי ההתחברות והמזהים של הפרויקט ב-Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAGTQRYzvT5A2g_23-5msvHXmNJQei3__4", // מפתח הגישה ל-API
  authDomain: "site-project-5cdc3.firebaseapp.com", // הדומיין המשמש לאימות
  projectId: "site-project-5cdc3", // מזהה הפרויקט בענן
  storageBucket: "site-project-5cdc3.firebasestorage.app", // כתובת אחסון הקבצים (תמונות וכו')
  messagingSenderId: "488100302464", // מזהה השולח עבור שירותי הודעות
  appId: "1:488100302464:web:d3672f761f65f4ddd0e065", // מזהה האפליקציה הספציפית
  measurementId: "G-TLG3QP5P16" // מזהה עבור שירותי אנליטיקס
};

// הפעלת האפליקציה ושמירת המופע שלה בתוך משתנה
const app = initializeApp(firebaseConfig);

// יצירת חיבור למסד הנתונים וייצוא שלו כדי שיהיה זמין לקבצים אחרים (כמו script.js)
export const db = getFirestore(app);
// יצירת חיבור למערכת המשתמשים וייצוא שלה לקבצים אחרים
export const auth = getAuth(app);
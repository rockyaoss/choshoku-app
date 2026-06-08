import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdd4RKxPrJlKHQjPzI77elz2UETAk_woA",
  authDomain: "choshoku-app.firebaseapp.com",
  projectId: "choshoku-app",
  storageBucket: "choshoku-app.firebasestorage.app",
  messagingSenderId: "137942313592",
  appId: "1:137942313592:web:7d1ddd7f6a9827ef099b8d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
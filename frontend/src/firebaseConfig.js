
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDCNH2ctIE5fD5yEU81mUyT18sN9vyRN8",
  authDomain: "login-arm-ed117.firebaseapp.com",
  projectId: "login-arm-ed117",
  storageBucket: "login-arm-ed117.firebasestorage.app",
  messagingSenderId: "873616439038",
  appId: "1:873616439038:web:581ed4dfd653ecc4ad17af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
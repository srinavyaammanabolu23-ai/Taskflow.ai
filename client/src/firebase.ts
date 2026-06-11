import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkm6rLHRYkMxq6quOEmQbOl_of1UfDdUw",
  authDomain: "taskflow-ai-9b939.firebaseapp.com",
  databaseURL: "https://taskflow-ai-9b939-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "taskflow-ai-9b939",
  storageBucket: "taskflow-ai-9b939.firebasestorage.app",
  messagingSenderId: "1605948705",
  appId: "1:1605948705:web:659a093163c335e6865a60",
  measurementId: "G-6X4VF7JRW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

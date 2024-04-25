// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6n01OwDioyaNzaht4CFjKVv8AhBcamf4",
  authDomain: "moviehub-e304c.firebaseapp.com",
  projectId: "moviehub-e304c",
  storageBucket: "moviehub-e304c.appspot.com",
  messagingSenderId: "921116256",
  appId: "1:921116256:web:bf3a46dd8d3c83dfd42d05",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

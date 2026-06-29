import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZ-ef3s7Q7iIQbOPu4SQt3eCqcyD4xeZI",
  authDomain: "waffle-time-8a839.firebaseapp.com",
  projectId: "waffle-time-8a839",
  storageBucket: "waffle-time-8a839.firebasestorage.app",
  messagingSenderId: "412238248745",
  appId: "1:412238248745:web:67207bbd8791d423341538"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

logoutBtn.addEventListener("click", async () => {
    alert("Logout button clicked!");

    await signOut(auth);

    window.location.href = "login.html";
});
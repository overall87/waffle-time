import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        window.location.href = "dashboard.html";

    } catch (error) {

        alert(error.message);

    }

});
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const logoutBtn = document.getElementById("logoutBtn");
const sellBtn = document.getElementById("sellBtn");

const modal = document.getElementById("sellModal");
const closeModal = document.getElementById("closeModal");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});

sellBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

document.getElementById("ticketForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const user = auth.currentUser;
        const quantity = Number(document.getElementById("ticketQuantity").value);

        const settingsRef = doc(db, "settings", "current");

        const ticketNumbers = await runTransaction(db, async (transaction) => {

            const settingsDoc = await transaction.get(settingsRef);

            if (!settingsDoc.exists()) {
                throw new Error("Settings document not found.");
            }

            const nextTicket = settingsDoc.data().nextTicket;

            const numbers = [];

            for (let i = 0; i < quantity; i++) {
                numbers.push(nextTicket + i);
            }

            transaction.update(settingsRef, {
                nextTicket: nextTicket + quantity
            });

            return numbers;
        });

        await addDoc(collection(db, "sales"), {

            customerName: document.getElementById("customerName").value,

            phone: document.getElementById("customerPhone").value,

            email: document.getElementById("customerEmail").value,

            quantity,

            ticketNumbers,

            sellerId: user.uid,

            createdAt: serverTimestamp()

        });

        alert(
            "🎉 Sale Complete!\n\nTickets:\n" +
            ticketNumbers.join(", ")
        );

        document.getElementById("ticketForm").reset();

        modal.style.display = "none";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});
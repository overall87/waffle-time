import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    orderBy,
    limit,
    doc,
    runTransaction,
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// --------------------
// Buttons
// --------------------

const logoutBtn = document.getElementById("logoutBtn");

const sellBtn = document.getElementById("sellBtn");
const heroSell = document.getElementById("heroSell");

const fundraiserBtn = document.getElementById("fundraiserBtn");

// --------------------
// Sell Ticket Modal
// --------------------

const sellModal = document.getElementById("sellModal");
const closeModal = document.getElementById("closeModal");

// --------------------
// Fundraiser Modal
// --------------------

const fundraiserModal = document.getElementById("fundraiserModal");
const closeFundraiser = document.getElementById("closeFundraiser");

// --------------------
// Authentication
// --------------------

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

// --------------------
// Logout
// --------------------

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});

// --------------------
// Sell Ticket Modal
// --------------------

function openSellModal() {
    sellModal.style.display = "flex";
}

sellBtn.addEventListener("click", openSellModal);

if (heroSell) {
    heroSell.addEventListener("click", openSellModal);
}

closeModal.addEventListener("click", () => {
    sellModal.style.display = "none";
});

// --------------------
// Fundraiser Modal
// --------------------

if (fundraiserBtn) {

    fundraiserBtn.addEventListener("click", () => {

        fundraiserModal.style.display = "flex";

    });

}

if (closeFundraiser) {

    closeFundraiser.addEventListener("click", () => {

        fundraiserModal.style.display = "none";

    });

}

// --------------------
// Close Modals
// --------------------

window.addEventListener("click", (e) => {

    if (e.target === sellModal) {

        sellModal.style.display = "none";

    }

    if (e.target === fundraiserModal) {

        fundraiserModal.style.display = "none";

    }

});

// --------------------
// Temporary Forms
// --------------------

document.getElementById("ticketForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

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

            fundraiser: document.getElementById("currentFundraiser").textContent,

            createdAt: serverTimestamp()

        });

        alert(
            "🎉 Sale Complete!\n\nTickets:\n\n" +
            ticketNumbers.join(", ")
        );

        sellModal.style.display = "none";

        document.getElementById("ticketForm").reset();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});

document.getElementById("fundraiserForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        await addDoc(collection(db, "fundraisers"), {

            name: document.getElementById("fundraiserName").value,

            ticketPrice: Number(document.getElementById("ticketPrice").value),

            startingTicket: Number(document.getElementById("startingTicket").value),

            endingTicket: Number(document.getElementById("endingTicket").value),

            nextTicket: Number(document.getElementById("startingTicket").value),

            drawingDate: document.getElementById("drawingDate").value,

            prize: document.getElementById("prize").value,

            createdAt: serverTimestamp()

        });

        alert("🎉 Fundraiser Saved!");

        fundraiserModal.style.display = "none";

        document.getElementById("fundraiserForm").reset();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});// --------------------
// Load Current Fundraiser
// --------------------

async function loadCurrentFundraiser() {

    const title = document.getElementById("currentFundraiser");

    try {

        const q = query(
            collection(db, "fundraisers"),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {

            const fundraiser = snapshot.docs[0].data();

            title.textContent = fundraiser.name;

        }

    } catch (error) {

        console.error(error);

    }

}

loadCurrentFundraiser();
// --------------------
// Dashboard Statistics
// --------------------

async function loadDashboardStats() {

    try {

        const salesSnapshot = await getDocs(collection(db, "sales"));

        let totalSales = 0;
        let totalTickets = 0;

        salesSnapshot.forEach((doc) => {

            const sale = doc.data();

            totalTickets += sale.quantity;

            // If older sales don't have ticketPrice yet,
            // default to $0 instead of crashing.
            totalSales += (sale.ticketPrice || 0) * sale.quantity;

        });

        document.getElementById("ticketsSold").textContent = totalTickets;

        document.getElementById("todaySales").textContent =
            "$" + totalSales.toFixed(2);

        const customerSnapshot =
            await getCountFromServer(collection(db, "sales"));

        document.getElementById("customerCount").textContent =
            customerSnapshot.data().count;

    } catch (error) {

        console.error(error);

    }

}

loadDashboardStats();
import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import "./style.css";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const expensesRef = collection(db, "expenses");

const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const totalExpenses =
  document.getElementById("totalExpenses");

const totalAmount =
  document.getElementById("totalAmount");


// Toast notification

function showToast(message, type = "success") {

  const oldToast = document.querySelector(".toast");

  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  const icon = type === "success" ? "✓" : "✕";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {

    toast.classList.add("hide");

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 2500);
}


// Add expense

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const title =
    document.getElementById("title").value.trim();

  const amount =
    Number(document.getElementById("amount").value);

  const category =
    document.getElementById("category").value;

  const date =
    document.getElementById("date").value;


  if (!title || !amount || !category || !date) {

    showToast(
      "Please fill all fields.",
      "error"
    );

    return;
  }


  try {

    await addDoc(expensesRef, {
      title: title,
      amount: amount,
      category: category,
      date: date
    });


    form.reset();

    await loadExpenses();

    showToast(
      "Expense added successfully."
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Failed to add expense.",
      "error"
    );
  }

});


// Load expenses

async function loadExpenses() {

  try {

    expenseList.innerHTML = "";

    let count = 0;
    let total = 0;

    const snapshot =
      await getDocs(expensesRef);


    snapshot.forEach((item) => {

      const expense = item.data();

      count++;

      total += Number(expense.amount);


      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td>${expense.title}</td>

        <td>
          Rs. ${Number(expense.amount).toLocaleString()}
        </td>

        <td>${expense.category}</td>

        <td>${expense.date}</td>

        <td>
          <button
            class="delete"
            data-id="${item.id}">
            Delete
          </button>
        </td>

      `;


      expenseList.appendChild(row);

    });


    totalExpenses.textContent = count;

    totalAmount.textContent =
      total.toLocaleString();


  } catch (error) {

    console.error(error);

    showToast(
      "Could not load expenses.",
      "error"
    );

  }

}


// Delete expense

expenseList.addEventListener(
  "click",
  async (event) => {

    if (
      !event.target.classList.contains("delete")
    ) {
      return;
    }


    const id =
      event.target.dataset.id;


    try {

      await deleteDoc(
        doc(db, "expenses", id)
      );


      await loadExpenses();

      showToast(
        "Expense deleted successfully."
      );


    } catch (error) {

      console.error(error);

      showToast(
        "Failed to delete expense.",
        "error"
      );

    }

  }
);


// Load when page opens

loadExpenses();
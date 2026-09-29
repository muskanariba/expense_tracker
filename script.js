import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";


// ===============================
// Firebase Configuration
// ===============================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// ===============================
// Initialize Firebase
// ===============================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const expensesRef = collection(db, "expenses");


// ===============================
// HTML Elements
// ===============================

const form = document.getElementById("expenseForm");

const expenseList = document.getElementById("expenseList");

const totalExpenses =
  document.getElementById("totalExpenses");

const totalAmount =
  document.getElementById("totalAmount");


// ===============================
// Add Expense
// ===============================

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

    alert("Please fill all fields.");

    return;
  }


  try {

    await addDoc(expensesRef, {

      title: title,

      amount: amount,

      category: category,

      date: date

    });


    alert("Expense added successfully!");

    form.reset();

    loadExpenses();

  }

  catch (error) {

    console.error(error);

    alert("Error adding expense.");

  }

});


// ===============================
// Load Expenses
// ===============================

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

  }

  catch (error) {

    console.error(error);

    alert("Error loading expenses.");

  }

}


// ===============================
// Delete Expense
// ===============================

expenseList.addEventListener("click", async (event) => {

  if (!event.target.classList.contains("delete")) {

    return;

  }


  const id =
    event.target.dataset.id;


  const confirmDelete =
    confirm("Are you sure you want to delete this expense?");


  if (!confirmDelete) {

    return;

  }


  try {

    await deleteDoc(
      doc(db, "expenses", id)
    );


    loadExpenses();

  }

  catch (error) {

    console.error(error);

    alert("Error deleting expense.");

  }

});


// ===============================
// Load expenses when app starts
// ===============================

loadExpenses();
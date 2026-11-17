import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Configuración web de Firebase (proyecto ta-te-ti)
const firebaseConfig = {
  apiKey: "AIzaSyC9WdMhPIzIUMVg3MFBz3PSED60e44N8K0",
  authDomain: "ta-te-ti-36987.firebaseapp.com",
  databaseURL: "https://ta-te-ti-36987-default-rtdb.firebaseio.com",
  projectId: "ta-te-ti-36987",
  storageBucket: "ta-te-ti-36987.firebasestorage.app",
  messagingSenderId: "814985451498",
  appId: "1:814985451498:web:92f10262c8a3f2a5a08493",
  measurementId: "G-QMKPXLT2C5"
}
const app = initializeApp(firebaseConfig);

// Base de datos que usan el resto de los scripts
export const db = getFirestore(app);

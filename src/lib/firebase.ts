
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8zP01FgvQMFEv16zd6A3lY2xTgFqFj3o",
  authDomain: "projectsurvey-eedeb.firebaseapp.com",
  projectId: "projectsurvey-eedeb",
  storageBucket: "projectsurvey-eedeb.firebasestorage.app",
  messagingSenderId: "433405392246",
  appId: "1:433405392246:web:dac7db6893b0a9037ab657",
  measurementId: "G-GZH1Q4KYLX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

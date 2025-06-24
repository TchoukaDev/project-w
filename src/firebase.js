import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDsdAfAdrlQbshpDNV3hd5LwMHhoGkAU3g",
  authDomain: "waves-27b13.firebaseapp.com",
  projectId: "waves-27b13",
  storageBucket: "waves-27b13.firebasestorage.app",
  messagingSenderId: "633092157591",
  appId: "1:633092157591:web:e835b798fd0124cf6579d2",
};

// apiKey	Identifie ton projet Firebase, utilisée par les SDK Firebase pour faire des requêtes
// authDomain	URL pour l'authentification par navigateur
// projectId	Identifiant unique de ton projet Firebase
// storageBucket	L'URL de ton service de stockage Firebase (pour les fichiers)
// messagingSenderId	ID pour Firebase Cloud Messaging (notifications push)
// appId	ID unique de ton app Firebase

// Initialiser firebase avec la configuration du projet
const app = initializeApp(firebaseConfig);

// Initialiser Firebase Authentification pour utiliser les fonctions d'inscription, connexion/deconnexion, changement d'état
export const auth = getAuth(app);

export default app;

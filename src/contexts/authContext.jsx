import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";

// Création du context
export const AuthContext = createContext(null);

// Créer un Provider pour envelopper l'app (children) et y injecter l'auth
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Permettre à firebase de surveiller et mettre à jour automatiquement chaque changement d'état.
  useEffect(() => {
    const unsusbcribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    //   nettoyage de la fonction
    return () => unsusbcribe();
  }, []);

  const logOut = () => signOut(auth);

  const createUser = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginUser = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const authValue = {
    user,
    loading,
    logOut,
    createUser,
    loginUser,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
export default AuthProvider;

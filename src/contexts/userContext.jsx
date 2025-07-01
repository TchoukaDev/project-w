import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { createContext, useState, useEffect } from "react";
import { auth } from "../utilities/firebase";
import { useQuery } from "@tanstack/react-query";
import { useUserRealTime } from "../hooks/useUserRealTime";

// Création du context
export const UserContext = createContext(null);

// Créer un Provider pour envelopper l'app (children) et y injecter l'auth
const UserProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  //  Ecouter les changements d'état d'authentification de l'utilisateur
  useEffect(() => {
    // onAuthStateChanged : fonction Firebase qui observe la connexion/déconnexion de l'utilisateur
    //  retourne une fonction unsubscribe pour arrêter l'écoute quand le composant est démonté
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      setAuthUser(currentUser); //Stocke l'utilisateur connecté
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Récupération de l'id utilisateur
  const uid = authUser?.uid;

  // Hook d'écoute des modifications des données de user en direct
  useUserRealTime(uid);

  const {
    data: userData,
    isLoading: userLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userData", uid],
    enabled: !!uid, //Lance la requête uniquement si uid existe (si un utilisateur est connecté)
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json`
      );
      if (!response.ok) {
        throw new Error(
          "Une erreur est survenue lors du chargement des données utilisateur."
        );
      }
      return await response.json();
    },
  });

  // Fusion des données de connexion et des données de la database. Si pas de données, on garde uniquement les données de connexion
  const user = authUser && userData ? { ...authUser, ...userData } : authUser;

  const loading = authLoading || userLoading;

  // Création de l'utilisateur

  const createUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Récupérer l'id unique de Firabase
    const uid = user.uid;
    // Écriture avec PUT sur la clé uid dans la base
    await fetch(
      `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uid,
          email: user.email,
        }),
      }
    );
  };

  // Connexion
  const loginUser = (email, password) => {
    setAuthLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Déconnexion
  const logOut = () => signOut(auth);
  // Variables partagées
  const userValue = {
    user,
    loading,
    isError,
    error,
    logOut,
    createUser,
    loginUser,
  };

  return (
    <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
  );
};
export default UserProvider;

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import { createContext, useState, useEffect } from "react";
import { auth } from "../utilities/firebase";
import { useQuery } from "@tanstack/react-query";
import { useUserRealTime } from "../hooks/useUserRealTime";
import { toast } from "react-toastify";

// Création du context
export const UserContext = createContext(null);

// Créer un Provider pour envelopper l'app (children) et y injecter l'auth
const UserProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const defaultPhoto = "/src/assets/images/anonyme.png";

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
  const user =
    authUser && userData
      ? { ...userData, ...authUser, photo: userData.photo || defaultPhoto }
      : authUser;

  const loading = authLoading || userLoading;

  // Création de l'utilisateur

  const createUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Récupérer l'id unique de Firebase
    const uid = user.uid;
    // Écriture avec PATCH sur la clé uid dans la base
    await fetch(
      `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uid,
          email: user.email,
          photo: "/src/assets/images/anonyme.png",
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

  // Modifier email ou mot de passe firebase
  async function changeUserCredential(oldPassword, newPassword) {
    // Vérifier qu'un utilisateur est connecté
    if (!auth.currentUser) {
      toast.error("Aucun utilisateur n'est connecté");
    }

    // 1. Construire le credential avec l'email actuel et l'ancien mot de passe
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email, // email actuel
      oldPassword // mot de passe fourni par l'utilisateur
    );

    // 2. Ré‑authentifier l'utilisateur
    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
    } catch {
      toast.error("Mot de passe incorrect");
      return;
    }

    if (newPassword) {
      if (newPassword == oldPassword) {
        toast.error(
          "Veuillez saisir un mot de passe différent du mot de passe actuel"
        );
        return;
      }
      //4. Mettre à jour le mot de passe
      else
        try {
          await updatePassword(auth.currentUser, newPassword);
          toast.success("Votre mot de passe a été modifié");
        } catch (error) {
          toast.error(error.message);
        }
    }
  }

  // Variables partagées
  const userValue = {
    user,
    loading,
    setLoading: setAuthLoading,
    isError,
    error,
    logOut,
    createUser,
    loginUser,
    changeUserCredential,
  };

  return (
    <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
  );
};
export default UserProvider;

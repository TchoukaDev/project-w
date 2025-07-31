import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signInWithPopup,
} from "firebase/auth";

import { createContext, useState, useEffect } from "react";
import { auth, googleProvider } from "../utilities/firebase";
import { useUserRealTime } from "../hooks/users/useUserRealTime";
import { toast } from "react-toastify";
import { useUserById } from "../hooks/users/useUserById";
import defaultPhoto from "/src/assets/images/anonyme.png";

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
  } = useUserById(uid);

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
          photo: defaultPhoto,
        }),
      }
    );
  };

  // Connexion classique avec mail + mot de passe
  const loginUser = (email, password) => {
    setAuthLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Fonction asynchrone pour gérer la connexion via Google
  const loginWithGoogle = async () => {
    // Active le chargement (pour afficher un spinner ou bloquer un bouton, par exemple)
    setAuthLoading(true);

    try {
      // 1. Lance la popup de connexion Google avec Firebase Auth
      const result = await signInWithPopup(auth, googleProvider);

      // 2. Récupère les informations du compte utilisateur connecté
      const user = result.user;

      // 3. Vérifie si l'utilisateur existe déjà dans la Realtime Database
      const res = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${user.uid}.json`
      );

      // 4. Convertit la réponse en objet JSON
      const userExists = await res.json();

      // 5. Si aucune donnée n'existe pour cet utilisateur (nouvel utilisateur)
      if (!userExists) {
        // On crée une "fiche" utilisateur dans la base, avec son ID et son e-mail
        await fetch(
          `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${user.uid}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.uid, // ID Firebase
              email: user.email, // Email Google
              photo: user.photoURL || defaultPhoto, // Photo Google, ou image par défaut
            }),
          }
        );
      }
      toast.success("Connexion réussie");
      // ✅ onAuthStateChanged (déjà présent dans le contexte) s'exécutera automatiquement
      // et mettra à jour `authUser` => `user` sera mis à jour avec userData fusionné
    } catch (error) {
      // En cas d'erreur (ex : popup fermée, problème réseau, etc.)
      console.error("Erreur lors de la connexion avec Google :", error);
      toast.error("Échec de la connexion avec Google");
    } finally {
      // Quel que soit le résultat, on stoppe le chargement
      setAuthLoading(false);
    }
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
    loginWithGoogle,
    changeUserCredential,
  };

  return (
    <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
  );
};
export default UserProvider;

/**
 * Composant principal de l'application.
 * Gère le routage, l'affichage du loader et la protection des routes selon l'état de connexion de l'utilisateur.
 */

import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { lazy, useContext } from "react";
import Layout from "./components/layout/Layout";
import ErrorElement from "./components/layout/ErrorElement";
import { UserContext } from "./contexts/userContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Loader from "./components/Loader";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./pages/Profile";
import Followers from "./pages/Followers";
import ForgotPassword from "./pages/ForgotPassword";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";

// Importation des pages et layouts en lazy loading pour optimiser le chargement
const SettingsLayout = lazy(() => import("./components/layout/SettingsLayout"));
const SettingsIndex = lazy(() => import("./pages/SettingsIndex"));
const UserInfos = lazy(() => import("./pages/UserInfos"));

/**
 * Fonction principale App.
 * Affiche un loader tant que l'utilisateur n'est pas chargé.
 * Définit la structure des routes de l'application.
 */
function App() {
  // Récupère l'utilisateur et l'état de chargement depuis le contexte global
  const { user, loading } = useContext(UserContext);

  // Affiche un loader pendant le chargement des données utilisateur
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  // Définition des routes de l'application
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorElement />,
      children: [
        // Page d'accueil : accessible uniquement si connecté
        {
          index: true,
          element: user ? <Home /> : <Navigate to="signIn" replace />,
        },
        // Profil de l'utilisateur connecté
        {
          path: "profile/",
          element: user ? <Profile /> : <Navigate to="/" replace />,
        },
        // Profil d'un autre utilisateur (par pseudo)
        {
          path: "profile/:pseudo",
          element: user ? <Profile /> : <Navigate to="/" replace />,
        },
        // Espace abonnés et abonnements
        {
          path: "followers",
          element: user ? <Followers /> : <Navigate to="/" replace />,
        },
        // Messagerie Globale
        {
          path: "messages/",
          element: user ? <Messages /> : <Navigate to="/" replace />,
        },
        // Conversation privée
        {
          path: "messages/:pseudo",
          element: user ? <Conversation /> : <Navigate to="/" replace />,
        },

        // Pages de paramètres (layout imbriqué)
        {
          path: "settings",
          element: user ? <SettingsLayout /> : <Navigate to="/" replace />,
          children: [
            {
              index: true,
              element: <SettingsIndex />,
            },
            {
              path: "infos",
              element: <UserInfos />,
            },
            {
              path: "changePassword",
              element: <UpdatePassword />,
            },
          ],
        },
        // Page de connexion : accessible uniquement si non connecté
        {
          path: "signIn",
          element: !user ? <SignIn /> : <Navigate to="/" replace />,
        },
        // Page de réinitialisation de mot de passe si utilisateur non connecté
        {
          path: "/forgotPassword",
          element: !user ? <ForgotPassword /> : <Navigate to="/" replace />,
        },
        // Page d'inscription : accessible uniquement si non connecté
        {
          path: "signUp",
          element: !user ? <SignUp /> : <Navigate to="/" replace />,
        },
      ],
    },
  ]);

  // Fournit le routeur à l'application
  return <RouterProvider router={router} />;
}

export default App;

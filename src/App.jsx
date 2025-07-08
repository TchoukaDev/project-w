import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { lazy, Suspense, useContext } from "react";
import Layout from "./components/layout/Layout";
import ErrorElement from "./components/layout/ErrorElement";
import { UserContext } from "./contexts/userContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Loader from "./components/Loader";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./pages/Profile";
import ProfilUser from "./components/ProfileUser";

const SettingsLayout = lazy(() => import("./components/layout/SettingsLayout"));
const SettingsIndex = lazy(() => import("./pages/SettingsIndex"));
const Language = lazy(() => import("./pages/Language"));
const UserInfos = lazy(() => import("./pages/UserInfos"));

function App() {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorElement />,
      children: [
        {
          index: true,
          element: user ? <Home /> : <Navigate to="signIn" replace />,
        },
        {
          path: "profile/",
          element: user ? <Profile uid={null} /> : <Navigate to="/" replace />,
        },
        {
          path: "profile/:uid",
          element: <ProfilUser />,
        },
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
            {
              path: "langage",
              element: <Language />,
            },
          ],
        },
        {
          path: "signIn",
          element: !user ? <SignIn /> : <Navigate to="/" replace />,
        },
        {
          path: "signUp",
          element: !user ? <SignUp /> : <Navigate to="/" replace />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

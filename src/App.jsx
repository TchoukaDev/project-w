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

const SettingsLayout = lazy(() => import("./components/layout/SettingsLayout"));
const SettingsIndex = lazy(() => import("./pages/SettingsIndex"));
const Language = lazy(() => import("./pages/Language"));
const UsersInfos = lazy(() => import("./pages/UserInfos"));

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
          path: "settings",
          element: user ? <SettingsLayout /> : <Navigate to="/" replace />,
          children: [
            {
              index: true,
              element: (
                <Suspense>
                  <SettingsIndex />
                </Suspense>
              ),
            },
            {
              path: "infos",
              element: <UsersInfos />,
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

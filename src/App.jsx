import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { lazy, Suspense, useContext } from "react";
import Layout from "./components/layout/Layout";
import ErrorElement from "./components/layout/ErrorElement";

import PrivateRoute from "./components/PrivateRoute";
import { AuthContext } from "./contexts/authContext";
import { RiseLoader } from "react-spinners";

const Home = lazy(() => import("./pages/Home"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));

function App() {
  const { user } = useContext(AuthContext);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorElement />,
      children: [
        {
          index: true,
          element: (
            <Suspense
              fallback={
                <RiseLoader color="white" margin={5} speedMultiplier={0.9} />
              }
            >
              {user ? <Home /> : <SignIn />}
            </Suspense>
          ),
        },
        {
          path: "/signUp",
          element: !user ? <SignUp /> : <Home />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

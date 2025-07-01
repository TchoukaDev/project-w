import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import UserProvider from "./contexts/userContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Loader from "./components/Loader.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="h-screen flex justify-center items-center">
            <Loader />
          </div>
        }
      >
        <UserProvider>
          {" "}
          <App />
          <ToastContainer
            theme="colored"
            autoClose={2500}
            position="top-right"
          />
        </UserProvider>
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);

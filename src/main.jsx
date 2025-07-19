import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import UserProvider from "./contexts/userContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Loader from "./components/Loader.jsx";

import Modal from "react-modal";
import ThemeProvider from "./contexts/themeContext.jsx";

const queryClient = new QueryClient();
Modal.setAppElement("#root");

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
        <ThemeProvider>
          <UserProvider>
            {" "}
            <App />
            <ToastContainer
              theme="colored"
              autoClose={2500}
              position="bottom-right"
            />
          </UserProvider>
        </ThemeProvider>
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);

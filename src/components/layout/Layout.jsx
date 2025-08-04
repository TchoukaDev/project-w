import { Outlet } from "react-router";
import { UserContext } from "../../contexts/userContext";
import { useContext } from "react";
import Header from "../Header";
import Footer from "../Footer";
import ThemeProvider from "../../contexts/themeContext";

export default function Layout({ children }) {
  const { user } = useContext(UserContext);
  return (
    <ThemeProvider>
      <div className={`min-h-screen flex flex-col`}>
        {user && <Header />}
        <Outlet />
        {children}
        {user && <Footer />}
      </div>
    </ThemeProvider>
  );
}

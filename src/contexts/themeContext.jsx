import { createContext, useState, useEffect, useContext } from "react";
import { useLocation } from "react-router";

// Création du contexte
export const themeContext = createContext(null);

export function useTheme() {
  return useContext(themeContext);
}

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const location = useLocation();
  const forcedDarkRoutes = ["/signIn", "/signUp", "/forgotPassword"];
  const isForcedDark = forcedDarkRoutes.includes(location.pathname);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    // Détecter si l'utilisateur a paramétré le mode Sombre comme favori (pas utile ici car on veut le mode dark par défaut)
    // const prefersDark = window.matchMedia(
    //   "(prefers-color-scheme: dark)"
    // ).matches;
    // prefersDark ? "dark" : "light";

    // Appliqué le thème stocké ou le dark
    const current = storedTheme || "dark";

    // Si on est sur une page noire forcée, on aplique le noir
    if (isForcedDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme(current);
      //   Ajouter la class dark, si current = dark
      document.documentElement.classList.toggle("dark", current === "dark");
    }
  }, [location.pathname]);

  // Bascule entre les thèmes
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <themeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </themeContext.Provider>
  );
};

export default ThemeProvider;

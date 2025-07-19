import { createContext, useState, useEffect, useContext } from "react";

// Création du contexte
export const themeContext = createContext(null);

export function useTheme() {
  return useContext(themeContext);
}

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    // Détecter si l'utilisateur a paramétré le mode Sombre comme favori (pas utile ici car on veut le mode dark par défaut)
    // const prefersDark = window.matchMedia(
    //   "(prefers-color-scheme: dark)"
    // ).matches;
    // prefersDark ? "dark" : "light";

    // Appliqué le thème stocké ou le dark
    const current = storedTheme || "dark";
    setTheme(current);
    //   Ajouter la class dark, si current = dark
    document.documentElement.classList.toggle("dark", current === "dark");
  }, []);

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

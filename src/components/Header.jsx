import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../contexts/userContext";
import { useSearchUser } from "../hooks/users/useSearchUser";
import { useDebounce } from "../hooks/utilities/useDebounce";
import Button from "./Button";
import Logo from "./Logo";
import anonymeImage from "/src/assets/images/anonyme.png";
import SearchBar from "./SearchBar";
import { ClipLoader } from "react-spinners";
import ToggleTheme from "./toggleTheme";

export default function Header() {
  const [research, setResearch] = useState("");
  const debouncedResearch = useDebounce(research, 400);
  const { usersFounded } = useSearchUser(debouncedResearch);
  const { logOut, user } = useContext(UserContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const navLinks = {
    Accueil: "/",
    Profil: "/profile",
    Abonnements: "/followers",
    Messages: "/messages",
    Préférences: "/settings",
  };

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    logOut()
      .then(() => {
        toast.success("Déconnexion réussie");
        navigate("/");
      })
      .catch(() => {
        toast.error("Une erreur est intervenue lors de la déconnexion");
      })
      .finally(() => setLoading(false));
  };

  return (
    <nav className="flex justify-between items-center w-[90%] mx-auto h-[100px] py-5 px-6 relative bg-transparent z-50">
      <Logo onClick={() => navigate("/")} size="sm" canBeClicked />

      {/* Menu hamburger mobile */}
      <button
        className="2xl:hidden z-50 cursor-pointer"
        onClick={() => setShowNav((prev) => !prev)}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {showNav ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Navigation animée */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-1/2 -translate-x-1/2 w-full 2xl:hidden mt-4 transition-colors duration-300 bg-gray-600 dark:bg-gray-900 p-4 rounded shadow-md"
          >
            <div className="flex flex-col gap-3 items-center">
              <div className="flex lg:hidden">
                <SearchBar
                  usersFounded={usersFounded}
                  setResearch={setResearch}
                />
              </div>
              {Object.entries(navLinks).map(([label, path]) => (
                <NavLink
                  key={label}
                  to={path}
                  className={({ isActive }) =>
                    `text-white text-lg font-medium ${
                      isActive ? "!text-blue-500" : "hover:text-blue-400"
                    }`
                  }
                  onClick={() => setShowNav(false)}
                >
                  {label}
                </NavLink>
              ))}
              <div className="flex sm:hidden">
                <Button
                  onClick={handleClick}
                  disabled={loading}
                  type="button"
                  margin="my-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      Déconnexion...
                      <ClipLoader size={10} color="white" />
                    </div>
                  ) : (
                    "Se déconnecter"
                  )}
                </Button>
              </div>
              <ToggleTheme />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation desktop */}
      <div className="hidden 2xl:flex gap-2 bg-gray-800 rounded-3xl items-center">
        {Object.entries(navLinks).map(([label, path]) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `text-white px-4 py-2 rounded-full font-medium ${
                isActive ? "bg-blue-500/30" : "hover:bg-blue-400/10"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="hidden lg:flex">
        <SearchBar usersFounded={usersFounded} setResearch={setResearch} />
      </div>

      {/* Thème + Profil + Déconnexion */}
      <div className="flex gap-4 items-center">
        <div className="hidden 2xl:flex">
          <ToggleTheme />
        </div>
        <div className="flex items-center gap-2">
          <img
            src={user.photo ? user.photo : anonymeImage}
            alt="Profil"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-white font-semibold text-sm">
            {user.pseudo || "Inconnu"}
          </span>
        </div>
        <div className="hidden sm:flex">
          <Button
            onClick={handleClick}
            disabled={loading}
            type="button"
            margin="my-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                Déconnexion...
                <ClipLoader size={10} color="white" />
              </div>
            ) : (
              "Se déconnecter"
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}

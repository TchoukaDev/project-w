import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../contexts/userContext";
import { useSearchUser } from "../hooks/users/useSearchUser";
import { useDebounce } from "../hooks/utilities/useDebounce";
import Logo from "./Logo";
import anonymeImage from "/src/assets/images/anonyme.png";
import SearchBar from "./SearchBar";
import ToggleTheme from "./toggleTheme";
import useConversationsByUser from "../hooks/messages/useConversationsByUser";
import { useClickOutside } from "../hooks/utilities/useClickOutside";

export default function Header() {
  // Valeur du champ de la barre de recherche
  const [research, setResearch] = useState("");
  // Valeur renvoyée après timeout de 400ms sans rien faire
  const debouncedResearch = useDebounce(research, 300);
  // Utilisateurs trouvés
  const { usersFounded } = useSearchUser(debouncedResearch);
  // Deconnexion
  const { logOut, user } = useContext(UserContext);
  const { data: conversations = [] } = useConversationsByUser(user.id);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer le statut hasUnread dans au moins une des conversations en cours
  const hasUnread = conversations.some(
    (conversation) => conversation.hasUnread
  );

  const navLinks = {
    Accueil: "/",
    Profil: "/profile",
    Abonnements: "/followers",
    Messages: "/messages",
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

  // Fermeture du menu sous la photo de profil si clique en dehors
  const divRef = useRef();
  const btnRef = useRef();
  useClickOutside(divRef, btnRef, () => setIsOpen(false));

  // Fermeture menu de navigation si clic en dehors
  const navRef = useRef();
  const btnNavRef = useRef();
  useClickOutside(navRef, btnNavRef, () => setShowNav(false));

  // Réinitialiser la barre après navigation
  useEffect(() => {
    setResearch("");
  }, [location.pathname]);

  return (
    <nav className="flex justify-between items-center w-[90%] mx-auto h-[100px] py-5 px-6 relative bg-transparent z-50">
      <Logo onClick={() => navigate("/")} size="sm" canBeClicked />

      {/* Menu hamburger mobile */}
      <button
        ref={btnNavRef}
        className="xl:hidden z-50 cursor-pointer"
        onClick={() => setShowNav((prev) => !prev)}
      >
        <svg
          className="w-6 h-6 text-gray-900 dark:text-white"
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
            ref={navRef}
            key="mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-1/2 -translate-x-1/2 w-full xl:hidden mt-4 transition-colors duration-300 bg-gray-400 dark:bg-gray-900 p-4 rounded shadow-md"
          >
            <div className="flex flex-col gap-3 items-center">
              <div className="flex lg:hidden">
                <SearchBar
                  usersFounded={usersFounded}
                  setResearch={setResearch}
                  research={research}
                />
              </div>
              {Object.entries(navLinks).map(([label, path]) => (
                <NavLink
                  key={label}
                  to={path}
                  className={({ isActive }) =>
                    ` text-lg font-medium relative ${
                      isActive ? "!text-blue-600" : "hover:text-blue-500"
                    }`
                  }
                  onClick={() => setShowNav(false)}
                >
                  <div>{label}</div>
                  {path === "/messages" && hasUnread && (
                    <div className="absolute top-0 -right-4 bg-red-600 h-[12px] w-[12px] rounded-full"></div>
                  )}
                </NavLink>
              ))}

              <div className="flex lg:hidden">
                <ToggleTheme />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation desktop */}
      <div className="hidden xl:flex gap-2 bg-gray-400 dark:bg-gray-800 rounded-3xl items-center transition-colors">
        {Object.entries(navLinks).map(([label, path]) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `text-white px-4 py-2 rounded-full relative font-medium transition-colors ${
                isActive
                  ? "bg-blue-500/70 dark:bg-blue-500/30"
                  : "hover:bg-blue-400/70 dark:hover:bg-blue-400/10"
              }`
            }
          >
            <div>{label}</div>
            {path === "/messages" && hasUnread && (
              <div className="absolute top-1 right-0 bg-red-600 h-[12px] w-[12px] rounded-full"></div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="hidden lg:flex">
        <SearchBar
          usersFounded={usersFounded}
          setResearch={setResearch}
          research={research}
        />
      </div>

      {/* Thème */}
      <div className="flex gap-4 items-center">
        <div className="hidden lg:flex">
          <ToggleTheme />
        </div>

        {/* Photo de profil */}
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 relative"
          ref={btnRef}
        >
          <img
            src={user.photo ? user.photo : anonymeImage}
            alt="Profil"
            className="cursor-pointer w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-2 hover:transform hover:scale-120 hover:border-blue-600 transition-all duration-300"
          />
          {/* Pseudo */}
          <span className=" font-semibold text-sm">
            {user.pseudo || "Inconnu"}
          </span>

          {/* Menu déroulant */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={divRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full w-[150%] text-center bg-gray-500 dark:bg-gray-600 flex flex-col rounded-tl-4xl rounded-tr rounded-bl rounded-br-4xl -left-full mt-2"
              >
                {" "}
                <Link
                  className="p-4 text-xs rounded-tl-4xl rounded-tr !text-white hover:bg-gray-700/20 dark:hover:bg-gray-300/10"
                  to="/settings"
                >
                  Préférences
                </Link>
                <div
                  className="text-xs p-4 rounded-br-4xl rounded-bl cursor-pointer !text-white  hover:bg-gray-700/20 dark:hover:bg-gray-300/10"
                  onClick={handleClick}
                  disabled={loading}
                >
                  Se déconnecter
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="hidden sm:flex"></div>
      </div>
    </nav>
  );
}

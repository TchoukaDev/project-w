import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import Button from "./Button";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Logo from "./Logo";
import anonymeImage from "/src/assets/images/anonyme.png";

export default function Header() {
  const { logOut } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const LogoClickHandler = () => {
    navigate("/");
  };

  const handleClick = () => {
    if (loading) {
      return;
    }
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

  const navLinks = {
    Accueil: "/",
    Profil: "/profile",
    Amis: "amis",
    Notifications: "/notifications",
    Messages: "/messages",
    Préférences: "/settings",
  };

  return (
    <nav className="flex justify-between items-center h-[100px] py-5 px-10 relative">
      <Logo onClick={LogoClickHandler} size="sm" canBeClicked />
      <button className="lg:hidden" onClick={() => setShowNav((prev) => !prev)}>
        <svg
          className="w-6 h-6"
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
      <div
        className={`${
          showNav
            ? "absolute top-full left-0 mt-6 lg:mt-0 flex flex-col justify-end z-10 lg:static lg:flex-row lg:justify-between bg-gray-900/30 p-2 rounded lg:items-center md:gap-3"
            : "hidden lg:flex lg:justify-between  lg:items-center md:gap-3"
        }`}
      >
        <div className="relative flex gap-2 p-2 rounded-full bg-gray-900">
          {Object.entries(navLinks).map(([label, path]) => (
            <NavLink
              key={label}
              to={path}
              className="relative z-10 px-4 py-2 rounded-3xl font-semibold text-white" //Container de la navbar
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator" //layoutId dit à Framer Motion : “ce bloc <motion.div> est le même élément que dans le composant précédent, même si son emplacement ou sa taille a changé. Anime sa transition entre les deux.” Le nom entre guiellement n'a pas d'importance
                      className="absolute inset-0 bg-blue-400/40 rounded-3xl"
                      transition={{
                        type: "spring", // Animation type ressort
                        stiffness: 500, // Raideur du ressort : plus élevé = plus rapide
                        damping: 60, // Amortissement : contrôle les oscillations
                      }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex gap-9">
        <div className="flex flex-row-reverse items-center gap-2">
          <img
            src={user.photo ? user.photo : anonymeImage}
            className="rounded-full w-[50px]"
            alt="Photo de profil"
          />
          <div className="font-semibold">
            {" "}
            {user.pseudo ? user.pseudo : "Inconnu"}
          </div>
        </div>
        <Button
          onClick={handleClick}
          value={loading ? "Déconnexion..." : "Se déconnecter"}
          disabled={loading}
          type="button"
          margin="my-2"
        />
      </div>
    </nav>
  );
}

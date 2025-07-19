import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";
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
  const [research, setResearch] = useState(""); // Champ de recherche
  const debouncedResearch = useDebounce(research, 400); // Anti-rebond de la recherche (400ms)
  const { usersFounded } = useSearchUser(debouncedResearch); // Résultats de recherches
  const { logOut, user } = useContext(UserContext); // Récupération des infos utilisateur
  const navigate = useNavigate(); // Pour les redirections

  const [loading, setLoading] = useState(false); // État de chargement pour le bouton de déconnexion
  const [showNav, setShowNav] = useState(false); // Contrôle l'affichage du menu en version mobile

  //  Liens de navigation
  const navLinks = {
    Accueil: "/",
    Profil: "/profile",
    Abonnements: "/followers",
    Messages: "/messages",
    Préférences: "/settings",
  };

  // Fonction de déconnexion
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
    <nav className="flex justify-between items-center h-[100px] py-5 px-10 relative">
      {/* Logo cliquable */}
      <Logo onClick={() => navigate("/")} size="sm" canBeClicked />

      {/* Bouton menu mobile */}
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

      {/* Navigation principale */}
      <div
        className={`${
          showNav
            ? "absolute top-full left-0 mt-6 flex flex-col justify-end z-10 bg-gray-900/30 p-2 rounded"
            : "hidden lg:flex"
        } lg:static lg:flex-row lg:justify-between lg:items-center md:gap-3`}
      >
        <div className="relative flex gap-2 p-2 rounded-full bg-gray-900">
          {Object.entries(navLinks).map(([label, path]) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-3xl font-semibold text-white ${
                  isActive ? "bg-blue-500/30" : "hover:bg-blue-400/10"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Zone de recherche */}
      <SearchBar usersFounded={usersFounded} setResearch={setResearch} />

      {/* Bouton de changement de thème */}
      <ToggleTheme />

      {/* Profil utilisateur + bouton déconnexion */}
      <div className="flex gap-9">
        <div className="flex flex-row-reverse items-center gap-2">
          <img
            src={user.photo ? user.photo : anonymeImage}
            className="rounded-full w-[50px]"
            alt="Photo de profil"
          />
          <div className="font-semibold">
            {user.pseudo ? user.pseudo : "Inconnu"}
          </div>
        </div>
        <Button
          onClick={handleClick}
          disabled={loading}
          type="button"
          margin="my-2"
        >
          {loading ? (
            <div>
              Déconnexion...
              <ClipLoader size={10} color="white" />
            </div>
          ) : (
            "Se déconnecter"
          )}
        </Button>
      </div>
    </nav>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function SearchBar({ usersFounded, setResearch }) {
  const [focusIndex, setFocusIndex] = useState(-1); // Index de l'élément sélectionné au clavier dans la liste déroulante
  const [isOpen, setIsOpen] = useState(false); // Affiche ou cache la liste de résultats

  const navigate = useNavigate();
  // Navigation clavier dans la liste de résultats

  const handleKeyDown = (e) => {
    // Si la liste n’est pas affichée, on ne fait rien
    if (!isOpen) return;

    // 👉 Flèche bas : sélectionne l’élément suivant
    if (e.key === "ArrowDown") {
      e.preventDefault(); // Empêche le scroll natif de la page

      setFocusIndex((prev) =>
        // Si on n’est pas encore à la fin de la liste, on augmente l’index
        prev < usersFounded.length - 1 ? prev + 1 : 0
      );
    }

    // 👉 Flèche haut : sélectionne l’élément précédent
    if (e.key === "ArrowUp") {
      e.preventDefault(); // Même chose : on évite le scroll natif

      setFocusIndex((prev) =>
        // Si on est au-dessus du premier élément, on diminue l’index
        prev > 0 ? prev - 1 : usersFounded.length - 1
      );
    }

    // 👉 Entrée : sélectionne l’élément actuellement surligné
    if (e.key === "Enter" && usersFounded[focusIndex]) {
      // On redirige vers la page de profil de l’utilisateur sélectionné
      navigate(`/profile/${usersFounded[focusIndex].pseudo}`);

      // On ferme la liste de suggestions
      setIsOpen(false);
    }

    // 👉 Escape : ferme simplement la liste
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // 🔄 À chaque fois que la liste des résultats change :

    // Réinitialise le focus clavier (aucun élément sélectionné au début)
    setFocusIndex(-1);
  }, [usersFounded]);

  return (
    <div className="relative">
      <div className="relative w-[250px]">
        <input
          type="text"
          placeholder="Rechercher un utilisateur"
          className="bg-white rounded-full outline-none p-2 border-2 border-transparent text-black w-full  focus:border-blue-600"
          onChange={(e) => setResearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />

        {/* Liste de résultats */}
        {isOpen && (
          <ul className="absolute top-full w-full mt-1 bg-white rounded shadow z-10 max-h-60 overflow-auto">
            {usersFounded.length === 0 ? (
              <li className="text-gray-600/50">Aucun utilisateur trouvé</li>
            ) : (
              usersFounded.map((user, index) => (
                <li
                  key={user.uid}
                  // Pas de OnClick car s'exécute après le blur, cela risquerait de fermer la liste avant la navigation
                  onMouseDown={() => {
                    navigate(`/profile/${user.pseudo}`);
                    setIsOpen(false);
                  }}
                  className={`p-2 cursor-pointer ${
                    focusIndex === index
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100 font-semibold"
                  }`}
                >
                  <span className="text-blue-600">
                    {user.firstName} {user.name}{" "}
                  </span>
                  <span className="text-gray-600/50">({user.pseudo})</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Icône de loupe */}
      <div className="absolute right-2 text-blue-600 top-1/2 bg-white -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-search"
        >
          <path d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </svg>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export default function SearchBar({ usersFounded, setResearch, research }) {
  const [focusIndex, setFocusIndex] = useState(-1); // Index de l’élément surligné avec le clavier
  const [isOpen, setIsOpen] = useState(false); // Contrôle l’affichage de la liste
  const inputRef = useRef(null); // Ref pour l’input, permet de manipuler le focus
  const isNavigatingRef = useRef(false); // Ref pour indiquer si on est en cours de navigation
  const navigate = useNavigate(); // Pour naviguer vers une autre page

  // 🔁 Reset du focusIndex à chaque fois que la liste change
  useEffect(() => {
    setFocusIndex(-1);
  }, [usersFounded]);

  // 🎯 Gestion clavier (flèches, entrée, escape)
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) => (prev < usersFounded.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => (prev > 0 ? prev - 1 : usersFounded.length - 1));
    }

    if (e.key === "Enter" && usersFounded[focusIndex]) {
      isNavigatingRef.current = true;

      // Ferme la liste et vide la recherche
      setIsOpen(false);

      // Force le champ à perdre le focus pour pouvoir le refocus ensuite
      inputRef.current?.blur();

      // Attend la fin du cycle pour naviguer
      setTimeout(() => {
        navigate(`/profile/${usersFounded[focusIndex].pseudo}`);
        isNavigatingRef.current = false;
      }, 0);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative w-[250px]">
        <input
          ref={inputRef}
          type="text"
          value={research}
          placeholder="Rechercher un utilisateur"
          className="bg-white rounded-full outline-none p-2 border-2 border-transparent text-black w-full focus:border-blue-600"
          onChange={(e) => setResearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // N’ouvre la liste que si on n’est pas en navigation
            if (!isNavigatingRef.current) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Ferme la liste sauf si on est en train de naviguer
            if (!isNavigatingRef.current) {
              setIsOpen(false);
            }
          }}
        />

        {/* Liste des résultats */}
        {isOpen && (
          <ul className="absolute top-full w-full mt-1 bg-white rounded shadow z-10 max-h-60 overflow-auto">
            {usersFounded.length === 0 ? (
              <li className="text-gray-600/50">Aucun utilisateur trouvé</li>
            ) : (
              usersFounded.map((user, index) => (
                <li
                  key={user?.id}
                  onMouseDown={() => {
                    isNavigatingRef.current = true;

                    // Ferme la liste , blur l'input
                    setIsOpen(false);
                    inputRef.current?.blur();

                    setTimeout(() => {
                      navigate(`/profile/${user.pseudo}`);
                      isNavigatingRef.current = false;
                    }, 0);
                  }}
                  className={`p-2 cursor-pointer ${
                    focusIndex === index
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100 font-semibold"
                  }`}
                >
                  <span className="text-blue-600">
                    {user.firstName} {user.name}
                  </span>
                  <span className="text-gray-600/50">({user.pseudo})</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Icône de recherche */}
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

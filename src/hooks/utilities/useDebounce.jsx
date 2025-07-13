import { useEffect, useState } from "react";

// Ce hook prend une valeur (par ex : la recherche tapée par l'utilisateur)
// et retourne une version "debouncée" (stabilisée après un délai)
export function useDebounce(value, delay = 300) {
  // On stocke la version "debouncée" de la valeur dans un état
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Quand value change, on lance un timer
    const timer = setTimeout(() => {
      // Une fois que le délai est passé sans nouvelle frappe,
      // on met à jour la valeur "debouncée"
      setDebouncedValue(value);
    }, delay);

    // Nettoyage : si l'utilisateur tape encore avant la fin du timer,
    // on annule le précédent `setTimeout()` pour en démarrer un nouveau
    return () => clearTimeout(timer);
  }, [value, delay]);

  // On retourne la valeur "stabilisée" après le délai
  return debouncedValue;
}

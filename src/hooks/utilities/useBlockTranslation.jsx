import { useEffect } from "react";

/**
 * Hook pour bloquer la traduction automatique du navigateur
 * @param {boolean} enabled - Active ou désactive le blocage
 */
export function useBlockTranslation(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // Force les attributs
    const setNoTranslate = () => {
      document.documentElement.setAttribute("translate", "no");
      document.documentElement.setAttribute("lang", "fr");
      document.documentElement.classList.add("notranslate");
      document.body.setAttribute("translate", "no");
      document.body.classList.add("notranslate");
    };

    setNoTranslate();

    // Observer pour maintenir les attributs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target;
          if (target === document.documentElement || target === document.body) {
            if (!target.getAttribute("translate")) {
              setNoTranslate();
            }
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["translate", "class"],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["translate", "class"],
    });

    return () => observer.disconnect();
  }, [enabled]);
}

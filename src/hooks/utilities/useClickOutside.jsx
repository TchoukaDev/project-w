import { useEffect } from "react";

// Hook pour détecter un clic en dehors de ref (et éventuellement ref2)
export function useClickOutside(ref, ref2 = null, callback) {
  useEffect(() => {
    function handleClick(event) {
      const clickedOutsideRef =
        ref.current && !ref.current.contains(event.target);
      const clickedOutsideRef2 =
        ref2?.current && !ref2.current.contains(event.target);

      // Si on clique en dehors des deux (ou de ref seul si ref2 est null)
      const isOutside = ref2
        ? clickedOutsideRef && clickedOutsideRef2
        : clickedOutsideRef;

      if (isOutside) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, ref2, callback]);
}

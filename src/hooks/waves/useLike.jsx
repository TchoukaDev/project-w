import { useQuery } from "@tanstack/react-query";

// Récupérer le like
export function useLike(wid, uid) {
  return useQuery({
    queryKey: ["like", wid, uid],
    queryFn: async () => {
      const res = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/likes/${wid}/${uid}.json`
      );
      const data = await res.json();

      return !!data;
    },
    enabled: !!uid && !!wid, // ne lance pas tant qu’il manque un des deux
  });
}

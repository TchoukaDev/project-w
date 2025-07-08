import { useQuery } from "@tanstack/react-query";

export function useWaves(uid = null) {
  const waveKey = uid ? ["waves", uid] : ["waves", "all"];

  return useQuery({
    queryKey: waveKey,
    queryFn: async () => {
      let url =
        "https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/waves.json";

      if (uid) {
        url += `?orderBy=${encodeURIComponent(
          '"uid"'
        )}&equalTo=${encodeURIComponent(`"${uid}"`)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des publications");
      }

      const result = await response.json();

      // Toujours retourner un tableau, même si result est null ou vide
      if (!result) return [];

      return Object.entries(result).map(([wid, wave]) => ({
        wid,
        ...wave,
      }));
    },
  });
}

import { useQuery } from "@tanstack/react-query";

export function useCounterLike(wid) {
  return useQuery({
    queryKey: ["counterLike", wid],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/likes/${wid}.json`
      );
      if (!response.ok) {
        throw new Error("Une erreur est survenue lors du comptage des likes");
      }
      const data = await response.json();
      const counterLike = data ? Object.entries(data).length : 0;
      return counterLike;
    },
    enabled: !!wid,
  });
}

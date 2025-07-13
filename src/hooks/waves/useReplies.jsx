import { useQuery } from "@tanstack/react-query";

export function useReplies(wid) {
  return useQuery({
    queryKey: ["waves", wid],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/waves/${wid}/replies.json`
      );
      if (!response.ok) {
        throw new Error(
          "Une erreur est intervenue lors de la récupération des données"
        );
      }

      const result = await response.json();
      const data = result
        ? Object.entries(result).map(([rid, reply]) => ({ ...reply, rid }))
        : [];
      return data;
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Récupérer tous les utilisateurs suivis par l'utilisateur actuel
export function useAllFollowing(currentUserId) {
  return useQuery({
    queryKey: ["allFollowing", currentUserId],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${currentUserId}/following.json`
      );
      if (!response.ok) {
        throw new Error("Une erreur est survenue");
      }
      const data = await response.json();
      if (!data) {
        return [];
      }
      const result = Object.keys(data);

      const fetchAll = result.map(async (userId) => {
        const response2 = await fetch(
          `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
        );
        if (!response2.ok) {
          throw new Error("Une erreur est survenue.");
        }
        const userData = await response2.json();

        return userData;
      });

      const following = await Promise.all(fetchAll);
      return following;
    },
    enabled: !!currentUserId,
    onError: (error) => toast.error(error),
  });
}

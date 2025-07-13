import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Récupérer un following précis pour gérer l'état d'abonnement ou non
export function useFollowing(currentUserId, followedUserId) {
  return useQuery({
    queryKey: ["following", currentUserId, followedUserId],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${currentUserId}/following/${followedUserId}.json`
      );

      if (!response.ok) {
        throw new Error("Une erreur est survenue");
      }
      const data = await response.json();
      return !!data;
    },
    enabled: !!currentUserId && !!followedUserId,
    onError: (error) => toast.error(error.message),
  });
}

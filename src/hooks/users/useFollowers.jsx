import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFollower(currentUserId, followedUserId) {
  return useQuery({
    queryKey: ["follower", currentUserId, followedUserId],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${followedUserId}/followers/${currentUserId}.json`
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Une erreur est survenue");
      }
      return !!data;
    },
    enabled: !!currentUserId && !!followedUserId,
    onError: (error) => toast.error(error.message),
  });
}

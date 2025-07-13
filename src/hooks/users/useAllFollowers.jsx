import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useAllFollowers(uid) {
  return useQuery({
    queryKey: ["allFollowers", uid],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}/followers.json`
      );

      if (!response.ok) {
        throw new Error("Une erreur est survenue");
      }
      const data = await response.json();
      const result = Object.keys(data);

      const fetchAll = result.map(async (userId) => {
        const response2 = await fetch(
          `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
        );
        if (!response2.ok) {
          throw new Error("une erreur est survenue");
        }
        const userData = await response2.json();

        return userData;
      });
      const followers = await Promise.all(fetchAll);
      return followers;
    },
    onError: (error) => toast.error(error.message),
    enabled: !!uid,
  });
}

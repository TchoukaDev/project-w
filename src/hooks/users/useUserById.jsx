import { useQuery } from "@tanstack/react-query";
import { database } from "../../utilities/firebase";
import { get, ref } from "firebase/database";

export function useUserById(uid) {
  return useQuery({
    queryKey: ["user", uid],
    queryFn: async () => {
      // Utilisation du SDK (Software Development Kit) pour récupérer les données. Même résultat que fetch(url/users/${uid})
      const snap = await get(ref(database, `users/${uid}`));
      return snap.exists() ? snap.val() : null;
    },
    enabled: !!uid,
  });
}

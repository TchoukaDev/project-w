import { useQuery } from "@tanstack/react-query";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../utilities/firebase";

/**
 * Hook permettant de récupérer un utilisateur à partir de son pseudo.
 * 🔍 On interroge Firebase pour trouver un utilisateur dont le champ "pseudo" correspond.
 * ⚠️ Nécessite que Firebase ait un index sur le champ "pseudo" (indexOn).
 */
export function useUserByPseudo(pseudo) {
  return useQuery({
    queryKey: ["userByPseudo", pseudo], // Unique pour chaque pseudo
    queryFn: async () => {
      // Création d'une requête Firebase pour chercher par pseudo
      const q = query(
        ref(database, "users"),
        orderByChild("pseudo"),
        equalTo(pseudo)
      );

      const snap = await get(q);
      if (!snap.exists()) return null;

      const data = snap.val(); //retourne l'objet user trouvé
      const uid = Object.keys(data)[0]; // Transforme en tableau et récupère l'UID de l'utilisateur trouvé
      return { uid, ...data[uid] }; // On retourne l'utilisateur avec son UID
    },
    enabled: !!pseudo, // N'exécute la requête que si un pseudo est fourni
  });
}

// Version fetch

async function fetchUserByPseudo(pseudo) {
  const url = `https://your-project-id.firebaseio.com/users.json?orderBy=${encodeURIComponent(
    '"pseudo"'
  )}&equalTo=${encodeURIComponent('"' + pseudo + '"')}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }

  const data = await response.json();

  // Si aucun utilisateur trouvé
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // On récupère le premier utilisateur trouvé
  const uid = Object.keys(data)[0];
  const user = data[uid];

  return { uid, ...user };
}

import { useQuery } from "@tanstack/react-query";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../utilities/firebase";

/**
 * Hook personnalisé pour récupérer les publications ("waves").
 * - Si un `uid` est fourni : récupère uniquement les publications de cet utilisateur.
 * - Sinon : récupère toutes les publications.
 *
 * Enrichit chaque publication avec les infos de l'utilisateur (`pseudo`, `photo`).
 */
export function useWaves(uid = null) {
  const waveKey = uid ? ["waves", uid] : ["waves", "all"];

  return useQuery({
    queryKey: waveKey,
    queryFn: async () => {
      let q;

      // 🔍 Création de la requête Firebase selon si on veut filtrer par utilisateur
      if (uid) {
        q = query(ref(database, "waves"), orderByChild("uid"), equalTo(uid));
      } else {
        q = ref(database, "waves");
      }

      // 🔄 Récupération des waves
      const snapshot = await get(q);
      const data = snapshot.val();

      // 📭 Aucun résultat : on retourne un tableau vide
      if (!data) return [];

      const waves = Object.entries(data).map(([wid, wave]) => ({
        wid,
        ...wave,
      }));

      // 👤 Pour chaque wave, on va chercher les infos utilisateur
      const enrichedWaves = await Promise.all(
        waves.map(async (wave) => {
          try {
            const userSnap = await get(ref(database, `users/${wave.uid}`));
            const userData = userSnap.val();

            return {
              ...wave,
              pseudo: userData?.pseudo || "Inconnu",
              photo: userData?.photo || null,
            };
          } catch (err) {
            console.error(
              "Erreur lors de la récupération de l'utilisateur",
              err
            );
            return {
              ...wave,
              pseudo: "Inconnu",
              photo: null,
            };
          }
        })
      );

      return enrichedWaves;
    },
  });
}

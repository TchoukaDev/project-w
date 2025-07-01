import { useQueryClient } from "@tanstack/react-query";
import { ref, onValue } from "firebase/database";
import { database } from "../utilities/firebase";
import { useEffect } from "react";

export function useUserRealTime(uid) {
  // 1. On récupère le QueryClient de React Query
  const queryClient = useQueryClient();

  // 2. useEffect qui s'exécute à chaque fois que 'uid' ou 'queryClient' change
  useEffect(() => {
    // 3. Si on n’a pas d’uid (pas connecté), on ne fait rien
    if (!uid) return;

    // 4. On crée une référence dans Firebase à l'emplacement des données utilisateur
    const userRef = ref(database, `users/${uid}`);

    // 5. onValue écoute en temps réel les changements sur cette référence
    const unsubscribe = onValue(userRef, (snapshot) => {
      // 6. snapshot.val() contient les données mises à jour à cet emplacement
      const updatedUser = snapshot.val();

      // 7. Si on a bien reçu des données (pas null)
      if (updatedUser) {
        // 8. On met à jour manuellement le cache React Query pour la clé ["userData", uid]
        //    Cela provoque la mise à jour de tous les composants qui utilisent ce cache
        queryClient.setQueryData(["userData", uid], updatedUser);
      }
    });

    // 9. Lorsque le composant est démonté ou que uid change, on nettoie l’écoute en appelant unsubscribe
    return () => unsubscribe();
  }, [uid, queryClient]);
}

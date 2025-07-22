import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ref, onValue, get, off } from "firebase/database";
import { database } from "../../utilities/firebase";
import { useEffect } from "react";

/**
 * Hook personnalisé qui permet de récupérer les messages privés entre deux utilisateurs.
 * Il utilise React Query pour gérer le cache et Firebase Realtime Database pour la synchro en temps réel.
 */

export function usePrivateMessages(currentUid, otherUid) {
  const queryClient = useQueryClient();

  // useQuery gère le chargement initial et les états (loading, error, data)
  const query = useQuery({
    queryKey: ["privateMessages", currentUid, otherUid],
    queryFn: async () => {
      // Fonction qui charge une seule fois l’historique des messages
      const snapshot = await get(
        ref(database, `privateMessages/${currentUid}/${otherUid}`) // Accès au nœud correspondant à la conversation dans Firebase
      );

      const data = snapshot.val() || {}; // Si aucune donnée n’existe, on retourne un objet vide
      const messages = Object.entries(data).map(([id, msg]) => ({
        id, // On récupère la clé (id Firebase) du message
        ...msg, // Et toutes ses données (texte, auteur, timestamp, etc.)
      }));

      messages.sort((a, b) => a.timestamp - b.timestamp); // On trie du plus ancien au plus récent
      return messages;
    },
    staleTime: 0, // Les données sont toujours considérées comme "périmées" pour forcer une mise à jour à chaque fois
  });

  // Ce useEffect écoute les mises à jour en temps réel de Firebase pour cette conversation
  useEffect(() => {
    const messagesRef = ref(
      database,
      `privateMessages/${currentUid}/${otherUid}` // Référence à la conversation dans Firebase
    );

    // onValue attache un listener : il s'exécutera à chaque changement dans la conversation
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {}; // Récupération des messages ou objet vide si rien
      const messages = Object.entries(data).map(([id, msg]) => ({
        id,
        ...msg,
      }));
      messages.sort((a, b) => a.timestamp - b.timestamp); // Trie chronologique

      // On injecte manuellement les données dans le cache de React Query
      queryClient.setQueryData(
        ["privateMessages", currentUid, otherUid], // Même clé que celle du useQuery
        messages // Les nouvelles données à insérer dans le cache
      );
    });

    // Nettoyage : on détache le listener Firebase lorsque le composant est démonté
    return () => off(messagesRef);
  }, [currentUid, otherUid, queryClient]); // Les dépendances nécessaires pour que l'effet se déclenche en cas de changement d’utilisateur

  return query; // On retourne l’objet complet renvoyé par useQuery (data, isLoading, error, etc.)
}

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { database } from "../../utilities/firebase";
import { ref, onValue, off } from "firebase/database";

export function usePrivateMessages(currentUserUid, otherUserUid) {
  const queryClient = useQueryClient();
  const conversationId = [currentUserUid, otherUserUid].sort().join("_");

  // On crée un effet qui installe un écouteur temps réel Firebase pour mettre à jour le cache React Query
  useEffect(() => {
    if (!currentUserUid || !otherUserUid) return;

    const messagesRef = ref(
      database,
      `conversations/${conversationId}/messages`
    );

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const messages = Object.entries(data).map(([id, msg]) => ({
        id,
        ...msg,
      }));
      messages.sort((a, b) => a.timestamp - b.timestamp);

      // Mise à jour manuelle du cache React Query
      queryClient.setQueryData(
        ["privateMessages", currentUserUid, otherUserUid],
        messages
      );
    });

    return () => off(messagesRef, "value", unsubscribe);
  }, [conversationId, currentUserUid, otherUserUid, queryClient]);

  // On lance une requête "vide" pour que React Query puisse gérer le cache et les états (loading, error...)
  return useQuery({
    queryKey: ["privateMessages", currentUserUid, otherUserUid],
    queryFn: async () => {
      // Récupère le cache actuel ou un tableau vide
      return (
        queryClient.getQueryData([
          "privateMessages",
          currentUserUid,
          otherUserUid,
        ]) || []
      );
    },
    enabled: !!currentUserUid && !!otherUserUid,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

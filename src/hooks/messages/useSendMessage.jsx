import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendMessage(conversationId, currentUserUid) {
  const queryClient = useQueryClient();

  return useMutation({
    // 🔁 Envoie le message au serveur
    mutationFn: async (messageText) => {
      const response = await fetch(
        `/https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/messages/${conversationId}`, // endpoint REST
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: messageText,
            uid: currentUserUid,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      // On suppose que l'API renvoie le message complet (id, text, uid, timestamp...)
      const savedMessage = await response.json();
      return savedMessage;
    },

    // 🔮 Mise à jour optimiste
    onMutate: async (messageText) => {
      const optimisticMessage = {
        id: `optimistic-${Date.now()}`, // id temporaire pour affichage
        text: messageText,
        uid: currentUserUid,
        timestamp: Date.now(), // timestamp local
      };

      // Annule les requêtes en cours pour éviter un conflit de cache
      await queryClient.cancelQueries(["messages", conversationId]);

      // Snapshot de l’état précédent pour rollback en cas d’erreur
      const previousMessages = queryClient.getQueryData([
        "messages",
        conversationId,
      ]);

      // Mise à jour immédiate du cache avec le nouveau message
      queryClient.setQueryData(["messages", conversationId], (old) => [
        ...(old || []),
        optimisticMessage,
      ]);

      // On retourne le snapshot dans le contexte
      return { previousMessages };
    },

    // 💥 Rollback si erreur
    onError: (err, messageText, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", conversationId],
          context.previousMessages
        );
      }
    },

    // ✅ Après succès, on invalide la requête pour forcer un refetch propre
    onSettled: () => {
      queryClient.invalidateQueries(["messages", conversationId]);
    },
  });
}

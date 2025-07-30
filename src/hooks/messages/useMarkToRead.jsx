import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function useMarkToRead(currentUserId, conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (readingState) => {
      if (!readingState) {
        const url = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/conversations/${conversationId}/lastMessage/readBy/${currentUserId}.json`;

        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(true),
        });

        if (!response.ok) {
          throw new Error("Une erreur est survenue");
        }
      }
    },

    // ✅ Rendu optimiste
    onMutate: async () => {
      // Annule les requêtes en cours sur la conversation
      await queryClient.cancelQueries(["conversations", conversationId]);

      // Récupère le cache actuel
      const previous = queryClient.getQueryData([
        "conversations",
        conversationId,
      ]);

      // Modifie le cache localement
      queryClient.setQueryData(["conversations", conversationId], (prev) => {
        console.log("mutation réussie");
        if (!prev?.lastMessage) return prev;
        return {
          ...prev,
          lastMessage: {
            ...prev.lastMessage,
            readBy: {
              ...prev.lastMessage.readBy,
              [currentUserId]: true,
            },
          },
        };
      });

      // Renvoie l'ancien état pour rollback
      return { previous };
    },

    onError: (error, readingState, context) => {
      console.log("mutation échouée");
      if (context?.previous) {
        queryClient.setQueryData(
          ["conversations", conversationId],
          context.previous
        );
      }

      toast.error(error.message);
    },

    // ✅ En cas de succès, on rafraîchit les données (si besoin)
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations", conversationId]);
    },
  });
}

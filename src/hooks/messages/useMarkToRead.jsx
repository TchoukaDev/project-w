import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function useMarkToRead(currentUserId, conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    // La fonction qui fait la requête au serveur
    mutationFn: async (readingState) => {
      if (readingState) {
        const url = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/conversations/${conversationId}/lastMessage/readBy/${currentUserId}.json`;

        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(true), // marquer comme lu
        });

        if (!response.ok) {
          throw new Error("Une erreur est survenue");
        }
      }
      // Si readingState est false, pas de mutation
    },

    // Mise à jour optimiste du cache
    onMutate: async (readingState) => {
      if (!readingState) return; // si false, ne rien faire

      // Annuler les requêtes en cours sur cette conversation
      await queryClient.cancelQueries(["conversations", conversationId]);

      // Sauvegarder l’état précédent pour rollback en cas d’erreur
      const previous = queryClient.getQueryData([
        "conversations",
        conversationId,
      ]);

      // Mise à jour locale optimiste : on met à jour readBy ET hasUnread
      queryClient.setQueryData(["conversations", conversationId], (prev) => {
        if (!prev?.lastMessage) return prev;
        return {
          ...prev,
          hasUnread: false, // on indique que la conversation n’a plus de message non lu
          lastMessage: {
            ...prev.lastMessage,
            readBy: {
              ...prev.lastMessage.readBy,
              [currentUserId]: true, // marquer comme lu dans readBy
            },
          },
        };
      });

      // Aussi mettre à jour la liste globale des conversations si elle est dans le cache
      queryClient.setQueryData(["conversations", currentUserId], (convs) => {
        if (!convs) return convs;
        return convs.map((conv) =>
          conv.id === conversationId ? { ...conv, hasUnread: false } : conv
        );
      });

      return { previous };
    },

    onError: (error, readingState, context) => {
      // Rollback du cache en cas d’erreur
      if (context?.previous) {
        queryClient.setQueryData(
          ["conversations", conversationId],
          context.previous
        );
      }
      toast.error(error.message);
    },

    // Invalider les queries après succès pour forcer rechargement serveur
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations", conversationId]);
      queryClient.invalidateQueries(["conversations", currentUserId]);
    },
  });
}

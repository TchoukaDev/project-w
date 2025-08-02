import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Hook pour récupérer les conversations d’un utilisateur avec un champ hasUnread calculé
export default function useConversationsByUser(currentUserId) {
  return useQuery({
    queryKey: ["conversations", currentUserId],
    queryFn: async () => {
      // 1. Récupérer la liste des IDs des conversations de l'utilisateur
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${currentUserId}/conversations.json`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des conversations");
      }
      const data = await response.json();
      if (!data) return [];

      // 2. Extraire les IDs des conversations
      const conversationIds = Object.keys(data);

      // 3. Pour chaque conversation, récupérer ses données complètes
      const fetchAll = conversationIds.map(async (conversationId) => {
        const url = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/conversations/${conversationId}.json`;
        const response2 = await fetch(url);
        if (!response2.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }
        const conversationData = await response2.json();

        // 4. Calculer si l'utilisateur a des messages non lus dans cette conversation
        // On vérifie que lastMessage existe, que readBy est un objet et si l'utilisateur l'a lu
        const hasUnread =
          conversationData.lastMessage &&
          conversationData.lastMessage.readBy &&
          !conversationData.lastMessage.readBy[currentUserId];

        return {
          id: conversationId,
          ...conversationData,
          hasUnread, // Ajout du champ hasUnread
        };
      });

      // 5. Attendre que toutes les conversations soient récupérées
      const conversations = await Promise.all(fetchAll);

      // 6. Trier les conversations par date du dernier message, du plus récent au plus ancien
      conversations.sort(
        (a, b) =>
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
      );

      return conversations;
    },
    onError: (error) => toast.error(error.message),
    enabled: !!currentUserId, // n’exécute la requête que si currentUserId est défini
  });
}

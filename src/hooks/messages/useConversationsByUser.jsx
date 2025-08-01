import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

// hook pour récupérer les conversations de l'utilisateur
export default function useConversationsByUser(currentUserId) {
  return useQuery({
    queryKey: ["conversations", currentUserId],
    queryFn: async () => {
      // 1. Récupère les IDs des conversations de l'utilisateur
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${currentUserId}/conversations.json`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des conversations");
      }
      const data = await response.json();
      if (!data) return [];

      const conversationIds = Object.keys(data);

      // 2. Récupère les infos de chaque conversation
      const fetchAll = conversationIds.map(async (conversationId) => {
        const url = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/conversations/${conversationId}.json`;
        const response2 = await fetch(url);
        if (!response2.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }
        const conversationData = await response2.json();

        // 3. Vérifie si l'utilisateur a lu le dernier message
        const hasUnread =
          (conversationData.lastMessage &&
            !conversationData.lastMessage.readBy) ||
          !conversationData.lastMessage.readBy[currentUserId];

        return {
          id: conversationId,
          ...conversationData,
          hasUnread, // 4. On ajoute ce champ à chaque conversation
        };
      });
      console.log(fetchAll);
      const conversations = await Promise.all(fetchAll);

      // 5. Trie par date du dernier message
      conversations.sort(
        (a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp
      );

      return conversations;
    },
    onError: (error) => toast.error(error.message),
    enabled: !!currentUserId,
  });
}

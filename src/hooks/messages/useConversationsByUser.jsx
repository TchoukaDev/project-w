import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

// hook pour récupérer les conversations de l'utilisateur
export default function useConversationsByUser(currentUserId) {
  return useQuery({
    queryKey: ["conversations", currentUserId],
    queryFn: async () => {
      // Récupérer les conversations (id) de l'utilisateur
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${currentUserId}/conversations.json`
      );
      if (!response.ok) {
        throw new Error(
          "Une erreur est survenue dans la récupération des conversations"
        );
      }
      const data = await response.json();
      if (!data) return [];
      const result = Object.keys(data);

      // Pour chaque conversation, récupérer les informations
      const fetchAll = result.map(async (conversationId) => {
        const response2 = await fetch(
          `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/conversations/${conversationId}.json`
        );

        if (!response2.ok) {
          throw new Error(
            "Une erreur est survenue dans la récupération des derniers messages"
          );
        }
        const conversationData = await response2.json();

        return { id: conversationId, ...conversationData };
      });
      const conversations = await Promise.all(fetchAll);

      // Trier les derniers message du plus ancien au plus récent
      conversations.sort(
        (a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp
      );

      return conversations;
    },
    onError: (error) => toast.error(error.message),
    enabled: !!currentUserId,
  });
}

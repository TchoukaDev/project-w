import { useQuery } from "@tanstack/react-query";

export default function useIsRead(conversationId, currentUserId) {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: async () => {
      const response = await fetch(
        `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/conversations/${conversationId}/lastMessage/readBy/${currentUserId}.json`
      );

      if (!response.ok) {
        throw new Error(
          "Une erreur est survenue dans la récupération de la conversation"
        );
      }

      const data = await response.json();

      return data;
    },
    enabled: !!conversationId,
  });
}

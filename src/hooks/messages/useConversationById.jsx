import { useQuery } from "@tanstack/react-query";
import { ref, get } from "firebase/database";
import { database } from "../../utilities/firebase";

export function useConversationById(conversationId) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const convoRef = ref(database, `conversations/${conversationId}`);
      const snapshot = await get(convoRef);
      return snapshot.exists() ? snapshot.val() : null;
    },
    enabled: !!conversationId, // Ne lance la requête que si conversationId est défini
  });
}

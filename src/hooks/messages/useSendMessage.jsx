import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendMessage(currentUserUid, otherUserUid) {
  const queryClient = useQueryClient();
  const databaseUrl =
    "https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app";

  const conversationId = [currentUserUid, otherUserUid].sort().join("_");

  return useMutation({
    mutationFn: async (messageData) => {
      const timestamp = Date.now();

      const newMessage = {
        message: messageData.message || "", // message texte (vide si juste une image)
        sender: currentUserUid,
        timestamp,
        readBy: {
          [currentUserUid]: true,
        },
      };

      // Si une image est incluse dans le message
      if (messageData.image) {
        newMessage.image = messageData.image;
      }

      // 1. Ajout du message
      const resPush = await fetch(
        `${databaseUrl}/conversations/${conversationId}/messages.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );

      const pushResult = await resPush.json();
      const newMessageId = pushResult.name;

      // 2. Mise à jour du dernier message
      await fetch(
        `${databaseUrl}/conversations/${conversationId}/lastMessage.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );

      // 3. Mise à jour des participants
      await fetch(
        `${databaseUrl}/conversations/${conversationId}/participants.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [currentUserUid]: true,
            [otherUserUid]: true,
          }),
        }
      );

      // 4. Mise à jour des utilisateurs
      await fetch(
        `${databaseUrl}/users/${currentUserUid}/conversations/${conversationId}.json`,
        {
          method: "PUT",
          body: "true",
        }
      );

      await fetch(
        `${databaseUrl}/users/${otherUserUid}/conversations/${conversationId}.json`,
        {
          method: "PUT",
          body: "true",
        }
      );

      return { ...newMessage, id: newMessageId };
    },

    onMutate: async (messageData) => {
      await queryClient.cancelQueries([
        "privateMessages",
        currentUserUid,
        otherUserUid,
      ]);

      const previousMessages = queryClient.getQueryData([
        "privateMessages",
        currentUserUid,
        otherUserUid,
      ]);

      const optimisticMessage = {
        id: "optimistic_" + Date.now(),
        message: messageData.message || "",
        sender: currentUserUid,
        timestamp: Date.now(),
        readBy: {
          [currentUserUid]: true,
        },
        optimistic: true,
      };

      if (messageData.image) {
        optimisticMessage.image = messageData.image;
      }

      queryClient.setQueryData(
        ["privateMessages", currentUserUid, otherUserUid],
        (old = []) => [...old, optimisticMessage]
      );

      return { previousMessages };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["privateMessages", currentUserUid, otherUserUid],
        context.previousMessages
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries([
        "privateMessages",
        currentUserUid,
        otherUserUid,
      ]);
    },
  });
}

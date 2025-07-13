import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export function useCreateReply(wid, uid, pseudo) {
  const queryClient = useQueryClient();

  const mutationFn = async (data) => {
    const replyData = {
      ...data,
      uid: uid,
      pseudo: pseudo,
      createdAt: new Date().toLocaleString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };
    const response = await fetch(
      `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/waves/${wid}/replies.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyData),
      }
    );

    if (!response.ok) {
      throw new Error("Une erreur est intervenue");
    }
    const result = await response.json();
    return { ...replyData, rid: result.name };
  };
  return useMutation({
    mutationFn,
    onMutate: async (data) => {
      await queryClient.cancelQueries(["replies", wid]);
      const previous = queryClient.getQueryData(["replies", wid]);
      const optimisticReply = {
        ...data,
        rid: Date.now(),
        pseudo,
        createdAt: new Date().toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      };
      queryClient.setQueryData(["replies", wid], (prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return [optimisticReply, ...current];
      });
      return { previous };
    },
    onError: (err, data, context) => {
      queryClient.setQueryData(["replies", wid], context.previous);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["replies", wid] }),
  });
}

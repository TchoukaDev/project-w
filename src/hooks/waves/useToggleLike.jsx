import { useMutation, useQueryClient } from "@tanstack/react-query";

// Valider ou annuler le like
export function useToggleLike(wid, uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currentLiked) => {
      const url = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/likes/${wid}/${uid}.json`;
      if (currentLiked) {
        await fetch(url, { method: "DELETE" });
      } else {
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(true),
        });
      }
    },
    onMutate: async (currentLiked) => {
      queryClient.setQueryData(["like", wid, uid], !currentLiked);
      queryClient.setQueryData(["counterLike", wid], (currentCount) =>
        currentLiked
          ? currentCount === 0
            ? 0
            : currentCount - 1
          : (currentCount += 1)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["like", wid, uid]);
      queryClient.invalidateQueries(["counterLike", wid]);
    }, //Pas d'async pour onError car ne retourne pas une promesse
    onError: (err, currentLiked) => {
      queryClient.setQueryData(["like", wid, uid], currentLiked);
      queryClient.setQueryData(["counterlike", wid], (currentCount) =>
        !currentLiked
          ? currentCount === 0
            ? 0
            : currentCount - 1
          : (currentCount += 1)
      );
    },
  });
}

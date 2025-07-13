import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteWave(uid) {
  const queryClient = useQueryClient();

  const mutationFn = async (wid) => {
    const response = await fetch(
      `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/waves/${wid}.json`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Une erreur est survenue lors de la suppression");
    }

    return wid;
  };
  // Mettre à jour les deux caches à chaque fois
  return useMutation({
    mutationFn,
    onMutate: async (wid) => {
      const allKey = ["waves", "all"];
      const userKey = ["waves", uid];

      await Promise.all([
        queryClient.cancelQueries({ queryKey: allKey }),
        queryClient.cancelQueries({ queryKey: userKey }),
      ]);

      const previousAll = queryClient.getQueryData(allKey);
      const previousUser = queryClient.getQueryData(userKey);

      queryClient.setQueryData(allKey, (old) =>
        Array.isArray(old) ? old.filter((wave) => wave.wid !== wid) : []
      );
      queryClient.setQueryData(userKey, (old) =>
        Array.isArray(old) ? old.filter((wave) => wave.wid !== wid) : []
      );

      return { previousAll, previousUser, allKey, userKey };
    },

    onSuccess: (_data, _variables, context) => {
      if (context?.allKey) {
        queryClient.invalidateQueries({ queryKey: context.allKey });
      }
      if (context?.userKey) {
        queryClient.invalidateQueries({ queryKey: context.userKey });
      }
    },

    onError: (_error, _wid, context) => {
      if (context?.allKey && context?.previousAll) {
        queryClient.setQueryData(context.allKey, context.previousAll);
      }
      if (context?.userKey && context?.previousUser) {
        queryClient.setQueryData(context.userKey, context.previousUser);
      }
    },
  });
}

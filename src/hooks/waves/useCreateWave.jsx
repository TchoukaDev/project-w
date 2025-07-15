import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateWave(uid, pseudo, photo) {
  const queryClient = useQueryClient();

  const mutationFn = async (data) => {
    const waveData = {
      ...data,
      uid,
      pseudo,
      photo,
      createdAt: new Date(),
    };

    const response = await fetch(
      "https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/waves.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waveData),
      }
    );

    if (!response.ok) {
      throw new Error("Une erreur est survenue lors de la publication");
    }

    const result = await response.json();
    return { ...waveData, wid: result.name };
  };

  return useMutation({
    mutationFn,
    onMutate: async (data) => {
      const allKey = ["waves", "all"];
      const userKey = ["waves", uid];

      await Promise.all([
        queryClient.cancelQueries({ queryKey: allKey }),
        queryClient.cancelQueries({ queryKey: userKey }),
      ]);

      const previousAll = queryClient.getQueryData(allKey);
      const previousUser = queryClient.getQueryData(userKey);

      const optimisticWave = {
        ...data,
        wid: Date.now(),
        pseudo,
        photo,
        uid,
        createdAt: new Date().toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      };

      queryClient.setQueryData(allKey, (prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return [optimisticWave, ...current];
      });
      queryClient.setQueryData(userKey, (prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return [optimisticWave, ...current];
      });

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
    onError: (_error, _variables, context) => {
      if (context?.allKey && context?.previousAll) {
        queryClient.setQueryData(context.allKey, context.previousAll);
      }
      if (context?.userKey && context?.previousUser) {
        queryClient.setQueryData(context.userKey, context.previousUser);
      }
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateUser(uid) {
  const queryClient = useQueryClient();

  const mutationFn = async (updatedData) => {
    const response = await fetch(
      `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    return await response.json();
  };

  return useMutation({
    mutationFn,

    onMutate: async (updatedData) => {
      // Annuler les requêtes en cours sur user et waves
      await queryClient.cancelQueries({ queryKey: ["user", uid] });
      await queryClient.cancelQueries({ queryKey: ["waves"] });
      await queryClient.cancelQueries({ queryKey: ["waves", uid] });

      // Sauvegarder l'ancien user data pour rollback en cas d'erreur
      const previousUserData = queryClient.getQueryData(["user", uid]);

      // Optimistic update user
      queryClient.setQueryData(["user", uid], (old) => ({
        ...old,
        ...updatedData,
      }));

      // Optimistic update waves : mettre à jour pseudo/photo dans toutes les waves de cet utilisateur
      const wavesKeys = [["waves"], ["waves", uid]];

      wavesKeys.forEach((key) => {
        queryClient.setQueryData(key, (old) => {
          if (!old) return old;
          // old est un tableau de waves
          return old.map((wave) =>
            wave.uid === uid
              ? { ...wave, ...updatedData } // Met à jour pseudo, photo, etc.
              : wave
          );
        });
      });

      return { previousUserData };
    },

    onSuccess: () => {
      // Invalider les caches user et waves pour recharger les données fraîches
      queryClient.invalidateQueries({ queryKey: ["user", uid] });
      queryClient.invalidateQueries({ queryKey: ["waves"] });
      queryClient.invalidateQueries({ queryKey: ["waves", uid] });
    },

    onError: (error, context) => {
      // Rollback en cas d'erreur
      if (context?.previousUserData) {
        queryClient.setQueryData(["user", uid], context.previousUserData);
      }
    },
  });
}

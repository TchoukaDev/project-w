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
      await queryClient.cancelQueries({ queryKey: ["userData", uid] });

      const previousUserData = queryClient.getQueryData(["userData", uid]);

      queryClient.setQueryData(["userData", uid], (prev) => ({
        ...prev,
        ...updatedData,
      }));

      return { previousUserData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData", uid] });
    },
    onError: (error, context) => {
      if (context?.previousUserData) {
        queryClient.setQueryData(["userData", uid], context.previousUserData);
      }
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook personnalisé pour gérer le suivi / arrêt de suivi d'un utilisateur
export function useToggleFollowing(currentUserId, followedUserId) {
  // Récupère l'instance du cache de React Query pour manipuler les données en cache
  const queryClient = useQueryClient();

  return useMutation({
    // Fonction déclenchée lors de la mutation (toggle follow/unfollow)
    mutationFn: async (currentFollowing) => {
      // URLs pour accéder aux données dans la base Firebase
      const url = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${currentUserId}/following/${followedUserId}.json`;
      const url2 = `https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users/${followedUserId}/followers/${currentUserId}.json`;

      if (currentFollowing) {
        // Si on suit déjà, on supprime le suivi dans les deux bases (following + followers)
        await fetch(url, { method: "DELETE" });
        await fetch(url2, { method: "DELETE" });
      } else {
        // Sinon, on ajoute le suivi dans les deux bases (PUT avec true)
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(true),
        });
        await fetch(url2, {
          method: "PUT",
          headers: { "Content-Type": "application/json" }, // Petite faute ici, devrait être headers au pluriel
          body: JSON.stringify(true),
        });
      }
    },

    // Fonction appelée immédiatement avant la mutation, pour faire un "optimistic update" (mise à jour optimiste du cache)
    onMutate: async (currentFollowing) => {
      // Met à jour le cache de la donnée "following" pour cet utilisateur + suivi, inverse la valeur (toggle)
      queryClient.setQueryData(
        ["following", currentUserId, followedUserId],
        !currentFollowing
      );

      // Récupère la liste actuelle des utilisateurs suivis depuis le cache
      const previousFollowing = queryClient.getQueryData([
        "allFollowing",
        currentUserId,
      ]);

      const previousFollowers = queryClient.getQueryData([
        "allFollowers",
        followedUserId,
      ]);

      // Crée une version "optimiste" de la liste des suivis :
      // - si on suit déjà (currentFollowing = true), on retire l'utilisateur de la liste
      // - sinon, on ajoute un objet représentant un utilisateur en cours d'identification
      const optimistic = currentFollowing
        ? previousFollowing.filter((user) => !user[followedUserId]) // filtre les objets qui n'ont pas la clé followedUserId
        : [
            ...previousFollowing,
            { [followedUserId]: { pseudo: "Identification en cours..." } },
          ];

      // Met à jour le cache avec la liste optimiste
      queryClient.setQueryData(["allFollowing", currentUserId], optimistic);

      const optimistic2 = currentFollowing
        ? previousFollowers.filter((user) => !user[currentUserId])
        : [
            ...previousFollowers,
            { [currentUserId]: { pseudo: "Identification en cours..." } },
          ];

      queryClient.setQueryData(["allFollowers", followedUserId], optimistic2);

      // Retourne la liste précédente pour pouvoir faire un rollback en cas d'erreur
      return { previousFollowing, previousFollowers };
    },

    // Fonction appelée en cas d'erreur lors de la mutation
    onError: (error, currentFollowing, context) => {
      // On remet dans le cache la valeur "following" comme elle était avant la mutation
      queryClient.setQueryData(
        ["following", currentUserId, followedUserId],
        currentFollowing
      );

      // On restaure la liste complète des suivis dans le cache avec la valeur précédente sauvegardée dans context
      queryClient.setQueryData(
        ["allFollowing", currentUserId],
        context?.previousFollowing || []
      );
      queryClient.setQueryData(
        ["allFollowers", followedUserId],
        context?.previousFollowers || []
      );
    },

    // Fonction appelée en cas de succès de la mutation
    onSuccess: () => {
      // On invalide les caches liés à ce suivi pour forcer la mise à jour des données depuis la source
      queryClient.invalidateQueries([
        "following",
        currentUserId,
        followedUserId,
      ]);
      queryClient.invalidateQueries(["allFollowing", currentUserId]);
      queryClient.invalidateQueries(["allFollowers", followedUserId]);
    },
  });
}

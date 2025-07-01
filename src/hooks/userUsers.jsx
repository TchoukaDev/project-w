import { useQuery } from "@tanstack/react-query";

// Hook personnalisé pour charger les utilisateurs
export function useUsers() {
  return useQuery({
    queryKey: ["users"], // Clé unique pour identifier cette requête dans le cache
    queryFn: async () => {
      // On fait une requête GET avec fetch
      const response = await fetch(
        "/https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users"
      );

      // On vérifie si la requête a réussi
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs");
      }

      // On transforme la réponse en JSON
      const data = await response.json();
      return data; // On retourne le tableau d'utilisateurs
    },
  });
}

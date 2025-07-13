import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function useSearchUser(output) {
  // State qui contiendra les utilisateurs filtrés
  const [usersFounded, setUsersFounded] = useState([]);

  const [loading, setLoading] = useState(false);

  // Ce useEffect s'exécute à chaque fois que `output` change
  useEffect(() => {
    // Si le champ est vide ou ne contient que des espaces, on ne fait rien
    if (!output || output.trim() === "") {
      setUsersFounded([]);
      return;
    }
    // Fonction asynchrone pour récupérer les utilisateurs depuis Firebase
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          "https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/users.json"
        );
        const data = await response.json();

        // On transforme l'objet retourné par Firebase en tableau
        const users = Object.values(data);

        // On met la chaîne de recherche en minuscule pour comparer sans casse
        const minOutput = output.toLowerCase();

        // On filtre les utilisateurs : on garde ceux dont le pseudo, nom ou prénom (en minuscules) contient la recherche
        const usersFiltered = users.filter((user) =>
          // .some return true pour les éléments du tableau qui incluent la valeur tapées dans l'input
          [user.pseudo, user.name, user.firstName].some((element) =>
            element?.toLowerCase().includes(minOutput)
          )
        );

        // On met à jour l’état
        setUsersFounded(usersFiltered);
      } catch (error) {
        toast.error("Erreur lors du chargement des utilisateurs :", error);
        setUsersFounded([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [output]);

  return { usersFounded, loading };
}

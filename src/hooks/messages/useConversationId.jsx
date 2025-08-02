import { useQuery } from "@tanstack/react-query";
import { ref, get } from "firebase/database";
import { database } from "../../utilities/firebase";

// Hook pour récupérer l'id d'une conversation entre 2 utilisateurs
export function useConversationId(currentUserId, otherUserId) {
  return useQuery({
    queryKey: ["conversationId", currentUserId, otherUserId],
    queryFn: async () => {
      // 1. Référence vers le noeud "conversations" dans Firebase
      const conversationsRef = ref(database, "conversations");

      // 2. Récupérer toutes les conversations une seule fois (pas de temps réel ici)
      const snapshot = await get(conversationsRef);

      // 3. Extraire les données
      const data = snapshot.val(); // ex : { idconv1: {participants: {...}}, idconv2: {...} }

      // 4. Rechercher une conversation contenant exactement les deux utilisateurs
      //    Object.entries(data) transforme un objet en tableau [ [id, obj], [id2, obj2], ... ]
      const conversationId = Object.entries(data || {}) // si data est null, on utilise un objet vide
        .find(([id, conversation]) => {
          // Pour chaque conversation...

          // Vérifie que le champ "participants" existe
          if (!conversation.participants) return false;

          // Récupère un tableau des IDs des participants (ex : ["uid1", "uid2"])
          const participantIds = Object.keys(conversation.participants);

          // Vérifie si les deux utilisateurs sont présents dans cette conversation
          const currentIncluded = participantIds.includes(currentUserId);
          const otherIncluded = participantIds.includes(otherUserId);

          // Si OUI, on a trouvé la bonne conversation => .find() s'arrête ici
          return currentIncluded && otherIncluded;
        })?.[0]; // .find() retourne [id, conversation] → on récupère seulement l'id

      // 5. Retourner l'id de la conversation trouvée (ou undefined s’il n’y en a pas)
      return conversationId;
    },
  });
}

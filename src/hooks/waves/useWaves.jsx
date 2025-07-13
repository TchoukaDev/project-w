import { useQuery } from "@tanstack/react-query";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../utilities/firebase";

// Version Firebase
export function useWaves(uid = null) {
  const waveKey = uid ? ["waves", uid] : ["waves", "all"];

  return useQuery({
    queryKey: waveKey,
    queryFn: async () => {
      let q;

      if (uid) {
        q = query(ref(database, "waves"), orderByChild("uid"), equalTo(uid));
      } else {
        q = ref(database, "waves");
      }

      const snapshot = await get(q);

      const data = snapshot.val();

      if (!data) return [];

      return Object.entries(data).map(([wid, wave]) => ({
        wid,
        ...wave,
      }));
    },
  });
}

// Version fetch
// function useWaves(uid = null) {
//   const waveKey = uid ? ["waves", uid] : ["waves", "all"];

//   return useQuery({
//     queryKey: waveKey,
//     queryFn: async () => {
//       let url =
//         "https://waves-27b13-default-rtdb.europe-west1.firebasedatabase.app/waves.json";

//       if (uid) {
//         url += ?orderBy=${encodeURIComponent(
//           '"uid"'
//         )}&equalTo=${encodeURIComponent("${uid}")};
//       }

//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error("Erreur lors du chargement des publications");
//       }

//       const result = await response.json();

//       // Toujours retourner un tableau, même si result est null ou vide
//       if (!result) return [];

//       return Object.entries(result).map(([wid, wave]) => ({
//         wid,
//         ...wave,
//       }));
//     },
//   });
// }

import { useContext } from "react";
import { useAllFollowing } from "../hooks/users/useAllFollowing";
import { UserContext } from "../contexts/userContext";
import { useAllFollowers } from "../hooks/users/useAllFollowers";
import { motion } from "framer-motion";

export default function Followers() {
  const { user } = useContext(UserContext);
  const { data: following = [], isLoading: loadingFollowing } = useAllFollowing(
    user?.uid
  );
  const { data: followers = [], isLoading: loadingFollowers } = useAllFollowers(
    user?.uid
  );
  return (
    <motion.main
      className="container flex flex-col"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grow flex flex-col flex-wrap overflow-auto">
        Les personnes qui vous suivent:
        {loadingFollowers && <p>Chargement en cours...</p>}
        {followers.length === 0 ? (
          <p>Vous n'avez aucun abonné pour le moment.</p>
        ) : (
          followers.map((user) => <p key={user.id}>{user.pseudo}</p>)
        )}
      </div>
      <div className="grow flex flex-col flex-wrap overflow-auto">
        Les personnes que vous suivez:{" "}
        {loadingFollowing && <p>Chargement en cours...</p>}
        {following.length === 0 ? (
          <p>Vous ne suivez aucun utilisateur pour l'instant</p>
        ) : (
          following.map((user) => <p key={user.id}>{user.pseudo}</p>)
        )}
      </div>
    </motion.main>
  );
}

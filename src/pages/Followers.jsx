import { useContext } from "react";
import { useAllFollowing } from "../hooks/users/useAllFollowing";
import { UserContext } from "../contexts/userContext";
import { useAllFollowers } from "../hooks/users/useAllFollowers";
import { motion } from "framer-motion";
import { Link } from "react-router";

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
      className="container flex flex-col px-16 py-8"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grow flex flex-col flex-wrap overflow-auto border-b border-gray-500 pb-8 ">
        <h1 className="text-center mb-5">Espace abonnés</h1>
        <p className=" mb-5 underline text-lg">Vos abonnés:</p>
        {loadingFollowers && <p>Chargement en cours...</p>}
        {followers.length === 0 ? (
          <p>Vous n'avez aucun abonné pour le moment.</p>
        ) : (
          followers.map((user) => (
            <Link to={`/profile/${user.pseudo}`} key={user.id}>
              <span className="flex items-center gap-3 hover:text-blue-600 text-gray-300 transition-colors duration:0.3">
                <img src={user.photo} className="w-[30px] rounded-full" />
                {user.firstName}
                {user.Name} ({user.pseudo})
              </span>
            </Link>
          ))
        )}
      </div>
      <div className="grow flex flex-col flex-wrap overflow-auto pt-8 ">
        <p className=" mb-5 underline text-lg">
          Les personnes que vous suivez:{" "}
        </p>
        {loadingFollowing && <p>Chargement en cours...</p>}
        {following.length === 0 ? (
          <p>Vous ne suivez aucun utilisateur pour l'instant</p>
        ) : (
          following.map((user) => (
            <Link to={`/profile/${user.pseudo}`} key={user.id}>
              <span className="flex items-center gap-3 hover:text-blue-600 text-gray-300 transition-colors duration:0.3">
                <img src={user.photo} className="w-[30px] rounded-full" />
                {user.firstName}
                {user.name} ({user.pseudo})
              </span>
            </Link>
          ))
        )}
      </div>
    </motion.main>
  );
}

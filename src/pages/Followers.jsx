// Importations
import { useContext } from "react";
import { useAllFollowing } from "../hooks/users/useAllFollowing"; // Hook personnalisé pour récupérer les personnes suivies
import { UserContext } from "../contexts/userContext"; // Contexte utilisateur
import { useAllFollowers } from "../hooks/users/useAllFollowers"; // Hook personnalisé pour récupérer les abonnés
import { motion } from "framer-motion"; // Pour les animations
import { Link } from "react-router"; // Pour la navigation entre les profils

export default function Followers() {
  const { user } = useContext(UserContext); // Récupération des données de l'utilisateur connecté

  // Récupération des utilisateurs que l'on suit
  const { data: following = [], isLoading: loadingFollowing } = useAllFollowing(
    user?.uid
  );

  // Récupération des utilisateurs qui nous suivent
  const { data: followers = [], isLoading: loadingFollowers } = useAllFollowers(
    user?.uid
  );

  return (
    <motion.main
      className="container !h-[100vh] flex flex-col px-16 py-8"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Section des abonnés */}
      <div className="grow flex flex-col flex-wrap overflow-auto border-b border-gray-600 pb-8 ">
        <h1 className="text-center mb-8 sm:mb-5">Espace abonnés</h1>
        <p className=" mb-5 underline text-lg">Vos abonnés:</p>

        {/* Si chargement en cours, afficher message */}
        {loadingFollowers && <p>Chargement en cours...</p>}

        {/* Si aucun abonné, afficher message, sinon afficher la liste */}
        {followers?.length === 0 ? (
          <p>Vous n'avez aucun abonné pour le moment.</p>
        ) : (
          followers?.map((user) => (
            // Chaque abonné est un lien vers son profil
            <Link to={`/profile/${user?.pseudo}`} key={user?.id}>
              <span className="flex items-center gap-3 hover:text-blue-600 text-gray-300 transition-colors duration:0.3">
                <img
                  src={user?.photo}
                  className="w-[30px] h-[30px] rounded-full"
                />
                {user?.firstName}
                {user?.Name} ({user?.pseudo})
              </span>
            </Link>
          ))
        )}
      </div>

      {/* Section des personnes suivies */}
      <div className="grow flex flex-col flex-nowrap md:flex-wrap overflow-auto pt-8 ">
        <p className=" mb-5 underline text-lg">
          Les personnes que vous suivez:{" "}
        </p>

        {/* Si chargement en cours, afficher message */}
        {loadingFollowing && <p>Chargement en cours...</p>}

        {/* Si aucun utilisateur suivi, afficher message, sinon afficher la liste */}
        {following.length === 0 ? (
          <p>Vous ne suivez aucun utilisateur pour l'instant</p>
        ) : (
          following.map((user) => (
            // Chaque utilisateur suivi est un lien vers son profil
            <Link to={`/profile/${user.pseudo}`} key={user.id}>
              <span className="flex items-center gap-3 hover:text-blue-600 text-gray-300 transition-colors duration:0.3">
                <img
                  src={user.photo}
                  className="w-[30px] h-[30px] rounded-full"
                />
                {user.firstName} {user.name} ({user.pseudo})
              </span>
            </Link>
          ))
        )}
      </div>
    </motion.main>
  );
}

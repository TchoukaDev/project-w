import { useContext } from "react";
import { UserContext } from "../contexts/userContext";
import { motion } from "framer-motion";
import { useWaves } from "../hooks/useWaves";
import { useUserById } from "../hooks/useUserById";

export default function Profile({ uid }) {
  const { user } = useContext(UserContext);
  const userId = uid || user.uid;
  const { data: userData = [], isLoading: loadingUser } = useUserById(userId);
  const { data: userWaves = [], isLoading: loadingWaves } = useWaves(userId);

  // Transformer la date en français
  const date = new Date(userData.birthday);
  const dateInFr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      className="container flex"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="basis-1/3 p-5 border-r flex flex-col justify-center items-center">
        <p>
          <img
            className="w-[200px] h-[200px] rounded mb-5"
            src={userData.photo}
          />
        </p>{" "}
        <p className="text-lg font-semibold mb-9">{userData.pseudo}</p>
        <div>
          {" "}
          <p className="underline mb-5">Informations personnelles:</p>
          <div className="flex flex-col gap-3 items-start">
            {user.firstName && (
              <p>
                <span className="text-gray-500">Prénom:</span>{" "}
                {userData.firstName}
              </p>
            )}
            {user.name && (
              <p>
                <span className="text-gray-500">Nom de famille:</span>{" "}
                {userData.name}
              </p>
            )}
            {userData.birthday && (
              <p>
                <span className="text-gray-500">Date de naissance:</span>{" "}
                {dateInFr}
              </p>
            )}
            {user.city && (
              <p>
                <span className="text-gray-500">Ville:</span> {userData.city}
              </p>
            )}
            {user.country && (
              <p>
                <span className="text-gray-500">Pays:</span> {userData.country}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="basis-2/3">
        <p>Vos publications récentes:</p>
        <div>
          {" "}
          {userWaves.length === 0 ? (
            <p>Aucune publication</p>
          ) : (
            userWaves.map((wave) => <div>{wave.message}</div>)
          )}
        </div>
      </div>
    </motion.div>
  );
}

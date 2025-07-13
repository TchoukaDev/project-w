import { useUserById } from "../hooks/users/useUserById";
import { useUserByPseudo } from "../hooks/users/useUserByPseudo";
import { useParams } from "react-router";
import { useContext, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, ChevronUp, X, ChevronDown } from "lucide-react";
import Modal from "react-modal";
import { useDeleteWave } from "../hooks/waves/useDeleteWave";
import { useReplies } from "../hooks/waves/useReplies";
import MakeReply from "../components/MakeReply";
import ShowReply from "../components/ShowReply";
import { useWaves } from "../hooks/waves/useWaves";
import { Link } from "react-router";
import Button from "../components/Button";
import LikeButton from "../components/LikeButton";
import FollowingButton from "../components/FollowingButton";

export default function Profile() {
  // States

  // État pour gérer l'ouverture du formulaire de réponse à un message
  const [activeReplyId, setActiveReplyId] = useState(null);
  // État pour afficher ou masquer les réponses d'un message
  const [showReply, setShowReply] = useState(null);
  // État pour stocker le message à supprimer
  const [wavetoDelete, setWavetoDelete] = useState(null);

  // Variables
  const { user } = useContext(UserContext);
  const { pseudo } = useParams();

  // Si aucun pseudo n'est dans l'URL, on affiche le profil connecté
  const isOwnProfile = !pseudo;

  // Si on regarde un autre profil, on récupère les données depuis Firebase
  const { data: userFromPseudo, isLoading: loadingPseudoUser } =
    useUserByPseudo(pseudo);

  // UID du profil à afficher (celui du pseudo ou celui de l'utilisateur connecté)
  const profileUid = isOwnProfile ? user.uid : userFromPseudo?.uid;

  // Récupération des données utilisateur et de ses waves
  const { data: userData = {}, isLoading: loadingUser } =
    useUserById(profileUid);
  const { data: waves = [], isLoading: loadingWaves } = useWaves(profileUid);

  // Hook pour supprimer un message
  const { mutate: mutateDeletePost, isLoading: isLoadingDelete } =
    useDeleteWave(null);

  // Transformer la date en français
  const date = new Date(userData.birthday);
  const dateInFr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  /**
   * Suppression d'un message sélectionné
   */
  const onDeleteClick = () => {
    if (isLoadingDelete) {
      return;
    }
    mutateDeletePost(wavetoDelete.wid, {
      onSuccess: () => {
        toast.success("Votre Wave a été supprimé.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
    setWavetoDelete(null);
  };

  /**
   * Ferme le formulaire de réponse
   */
  const onCloseReviewForm = () => {
    setActiveReplyId(false);
  };

  /**
   * Affiche ou masque les réponses d'un message
   * @param {string} id - ID du message
   */
  const onClickShowReplies = (id) => {
    setShowReply(id);
  };

  /**
   * Composant interne pour afficher le nombre de réponses à un message
   */
  function RepliesCount({ wid, onClickShowReplies }) {
    const { data: replies = [] } = useReplies(wid);
    return (
      <div
        onClick={onClickShowReplies}
        className="hover:text-blue-600 hover:cursor-pointer text-xs text-gray-400 flex items-center gap-2"
      >
        {/* Affiche le nombre de réponses */}
        💬 {replies.length} {replies.length === 1 ? "réponse" : "réponses"}{" "}
        {showReply === wid ? (
          <ChevronUp size={16} strokeWidth={2.75} />
        ) : (
          <ChevronDown size={16} strokeWidth={2.75} />
        )}
      </div>
    );
  }

  if (!profileUid || loadingUser || loadingWaves) return <p>Chargement...</p>;
  if (!userData) return <p>Utilisateur non trouvé</p>;

  return (
    <>
      <motion.main
        className="container flex"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="basis-1/3 p-5 border-r flex flex-col justify-center items-center">
          <div>
            <img
              className="w-[200px] h-[200px] rounded mb-5"
              src={userData.photo}
            />
          </div>{" "}
          <p className="text-lg font-semibold mb-9">{userData.pseudo}</p>
          <div>
            {" "}
            <p className="underline mb-5">Informations personnelles:</p>
            <div className="flex flex-col gap-3 items-start">
              {userData.firstName && (
                <p>
                  <span className="text-gray-500">Prénom:</span>{" "}
                  {userData.firstName}
                </p>
              )}
              {userData.name && (
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
              {userData.city && (
                <p>
                  <span className="text-gray-500">Ville:</span> {userData.city}
                </p>
              )}
              {userData.country && (
                <p>
                  <span className="text-gray-500">Pays:</span>{" "}
                  {userData.country}
                </p>
              )}
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 mt-7">
                <FollowingButton
                  currentUserId={user.uid}
                  followedUserId={profileUid}
                />
                <Button value="Envoyer un message"></Button>
              </div>
            )}
          </div>
        </div>
        <div className=" flex flex-col items-center py-5 px-16 gap-10 grow">
          <h1
            className="text-center
       w-full"
          >
            {isOwnProfile
              ? "Vos publications récentes:"
              : "Publications récentes:"}
          </h1>

          {/* Liste des messages */}
          <div className="flex flex-col w-full">
            {waves?.length == 0 ? (
              // Aucun message à afficher
              <p className=" flex flex-col justify-center text-xl  items-center grow">
                Aucune actualité pour le moment.
              </p>
            ) : (
              // Affichage des messages triés par date décroissante
              [...waves]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((wave) => (
                  <div key={wave.wid} className="flex flex-col mb-6 relative">
                    {/* En-tête du message */}
                    <div className=" flex flex-col gap-5 border border-gray-300/20 w-full rounded-t py-3 px-6">
                      <div className="flex gap-5 items-center">
                        <div className="flex justify-between items-center grow">
                          {/* Lien vers le profil de l'auteur */}
                          <Link
                            className="underline text-xl text-blue-600 !font-pompiere"
                            to={
                              wave.pseudo === user.pseudo
                                ? "/profile"
                                : `/profile/${wave.pseudo}`
                            }
                          >
                            {wave.pseudo}
                          </Link>
                          {/* Date de publication */}
                          <div className="text-white/50 !font-pompiere">
                            {wave.createdAt}
                          </div>
                        </div>
                        {/* Bouton de suppression si c'est le message de l'utilisateur */}
                        {wave.uid === user.uid && (
                          <div className="flex items-start">
                            <X
                              onClick={() => setWavetoDelete(wave)}
                              className="hover:cursor-pointer hover:text-blue-600"
                              size={16}
                              strokeWidth={2.75}
                            />
                          </div>
                        )}
                      </div>
                      {/* Contenu du message */}
                      <p>{wave.message}</p>
                    </div>
                    {/* Actions sous le message */}
                    <div className=" bg-gray-900/40  p-1 rounded-b flex justify-evenly items-center">
                      {/* Bouton "J'aime" */}

                      <LikeButton
                        uid={user.uid}
                        wid={wave.wid}
                        wuid={wave.uid}
                      />

                      {/* Bouton pour répondre */}
                      <div
                        onClick={() => {
                          if (showReply) {
                            setShowReply(null);
                          }
                          setActiveReplyId((prev) =>
                            prev === wave.wid ? null : wave.wid
                          );
                        }}
                        className="hover:text-blue-600 hover:cursor-pointer text-xs flex gap-2 items-center  text-gray-400 p-1 transition-colors duration-300"
                      >
                        <p>Répondre</p>
                        {activeReplyId === wave.wid ? (
                          <ChevronUp size={16} strokeWidth={2.75} />
                        ) : (
                          <Reply size={16} strokeWidth={2.75} />
                        )}
                      </div>
                      {/* Affichage du nombre de réponses */}
                      <RepliesCount
                        onClickShowReplies={() => {
                          if (activeReplyId) {
                            setActiveReplyId(null);
                          }
                          onClickShowReplies((prev) =>
                            prev === wave.wid ? null : wave.wid
                          );
                        }}
                        wid={wave.wid}
                      />
                    </div>
                    {/* Affichage des réponses si demandé */}
                    <AnimatePresence>
                      {showReply === wave.wid && <ShowReply wid={wave.wid} />}
                    </AnimatePresence>
                    {/* Affichage du formulaire de réponse si demandé */}
                    <AnimatePresence>
                      {activeReplyId === wave.wid && (
                        <MakeReply
                          wid={wave.wid}
                          onCloseReviewForm={onCloseReviewForm}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ))
            )}
          </div>
        </div>
      </motion.main>

      {/* Modale de confirmation de suppression */}
      {wavetoDelete && (
        <Modal
          isOpen={true}
          className="bg-black border shadow shadow-custom p-6 rounded  w-1/3 h-1/3 mx-auto mt-40"
          overlayClassName="fixed inset-0 z-10 bg-black/60 flex justify-center items-center"
          onRequestClose={() => setWavetoDelete(null)}
        >
          <div className="flex flex-col justify-evenly h-full items-center-safe">
            <p className="font-semibold">
              Voulez-vous vraiment supprimer ce post?{" "}
            </p>
            <div className="flex gap-10 items-center">
              <Button
                onClick={onDeleteClick}
                type="button"
                value="Valider"
              ></Button>
              <Button
                onClick={() => setWavetoDelete(null)}
                type="button"
                value="Annuler"
              ></Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

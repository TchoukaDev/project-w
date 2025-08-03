import { useUserById } from "../hooks/users/useUserById";
import { useUserByPseudo } from "../hooks/users/useUserByPseudo";
import { useParams } from "react-router";
import { useContext, useRef, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Modal from "react-modal";
import { useDeleteWave } from "../hooks/waves/useDeleteWave";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useWaves } from "../hooks/waves/useWaves";
import { Link } from "react-router";
import Button from "../components/Button";
import FollowingButton from "../components/FollowingButton";
import { dateToFr } from "../utilities/functions";
import { ClipLoader } from "react-spinners";
import { useClickOutside } from "../hooks/utilities/useClickOutside";
import WaveInteraction from "../components/WaveInteractions";

export default function Profile() {
  // States

  // État pour gérer l'ouverture du formulaire de réponse à un message
  const [activeReplyId, setActiveReplyId] = useState(null);
  // État pour afficher ou masquer les réponses d'un message
  const [showReply, setShowReply] = useState(null);
  // État pour stocker le message à supprimer (utilisé dans la modale de confirmation)
  const [wavetoDelete, setWavetoDelete] = useState(null);

  // Variables
  // Récupération de l'utilisateur connecté depuis le contexte global
  const { user } = useContext(UserContext);
  // Récupération du paramètre "pseudo" dans l'URL (profil à afficher)
  const { pseudo } = useParams();

  // Si aucun pseudo n'est dans l'URL, on affiche le profil connecté
  const isOwnProfile = !pseudo;

  // Si on regarde un autre profil, on récupère les données depuis Firebase via le pseudo
  const { data: userFromPseudo, isLoading: loadingPseudoUser } =
    useUserByPseudo(pseudo);

  // UID du profil à afficher : celui du pseudo ou celui de l'utilisateur connecté
  const profileUid = isOwnProfile ? user.uid : userFromPseudo?.uid;

  // Récupération des données utilisateur (profil) via l'UID
  const { data: userData = {}, isLoading: loadingUser } =
    useUserById(profileUid);
  // Récupération des messages ("waves") de l'utilisateur affiché
  const { data: waves = [], isLoading: loadingWaves } = useWaves(profileUid);

  // Hook pour supprimer un message (wave)
  const { mutate: mutateDeletePost, isLoading: isLoadingDelete } =
    useDeleteWave(null);

  // Transformer la date de naissance en format français lisible
  const date = new Date(userData.birthday);
  const dateInFr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  /**
   * Suppression d'un message sélectionné
   * Vérifie que la suppression n'est pas déjà en cours, puis appelle la mutation.
   * Affiche un toast de succès ou d'erreur selon le résultat.
   */
  const onDeleteClick = () => {
    if (isLoadingDelete) {
      return; // Ne rien faire si déjà en cours de suppression
    }
    mutateDeletePost(wavetoDelete.wid, {
      onSuccess: () => {
        toast.success("Votre Wave a été supprimé.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
    setWavetoDelete(null); // Ferme la modale après la demande
  };

  /**
   * Ferme le formulaire de réponse (en réinitialisant l'id actif)
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

  // Gérer la fermeture du formulaire de réponse lorsqu'on clique en dehors
  const makeReplyRef = useRef();
  const makeReplyBtn = useRef();
  useClickOutside(makeReplyRef, makeReplyBtn, () => setActiveReplyId(false));

  // Gérer la fermeture de l'affichage des réponses lorsqu'on clique en dehors
  const showReplyRef = useRef();
  const showReplyBtnRef = useRef();
  useClickOutside(showReplyRef, showReplyBtnRef, () => setShowReply(false));

  return (
    <>
      <motion.main
        className="container flex-col lg:flex-row flex"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Colonne de gauche : informations personnelles du profil */}
        <div className="basis-1/3 py-5 px-5 md:px-16 border-b lg-border-b-0 lg:border-r border-gray-600 flex flex-col justify-center items-center">
          {/* Affiche un message de chargement si UID manquant ou données en cours de chargement */}
          {(!profileUid || loadingUser || loadingWaves) && (
            <p>Chargement en cours...</p>
          )}
          {/* Si l'utilisateur n'existe pas, affiche un message d'erreur */}
          {!userData && <p>Utilisateur non trouvé</p>}
          <div>
            {/* Photo de profil */}
            <img
              className="w-[200px] h-[200px] rounded mb-5"
              src={userData.photo}
            />
          </div>{" "}
          {/* Pseudo */}
          <p className="text-lg font-semibold mb-9">{userData.pseudo}</p>
          <div>
            <p className="underline text-center mb-5">
              Informations personnelles:
            </p>
            {/* Liste des infos personnelles, affichage conditionnel si données présentes */}
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
            {/* Si ce n'est pas le profil de l'utilisateur connecté, afficher les boutons suivre et message */}
            {!isOwnProfile && (
              <div className="flex gap-2 mt-7">
                <FollowingButton
                  currentUserId={user.uid}
                  followedUserId={profileUid}
                />
                <Link
                  className="bg-gray-300/30 rounded-3xl px-4 py-2 font-semibold text-sm text-center  hover:bg-blue-600 cursor-pointer transition-color duration-300"
                  to={`/messages/${userData.pseudo}`}
                >
                  Envoyer un message
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite : liste des publications (waves) */}
        <div className=" flex flex-col items-center py-5 mt-10 px-5 md:px-16 gap-10 overflow-auto grow">
          <h1 className="text-center w-full">
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
                    <div className=" flex flex-col gap-5 border border-gray-300 transition-all dark:border-gray-300/20 w-full rounded-t py-3 px-6">
                      <div className="flex gap-5 items-center">
                        <div className="flex justify-between items-center grow">
                          {/* Lien vers le profil de l'auteur */}
                          <Link
                            to={
                              wave.pseudo === user.pseudo
                                ? "/profile"
                                : `/profile/${wave.pseudo}`
                            }
                          >
                            <div className="flex items-center gap-3 underline text-xl text-blue-600 !font-pompiere">
                              <img
                                src={wave.photo}
                                className="w-[30px] h-[30px] rounded-full"
                              />{" "}
                              {wave.pseudo}
                            </div>
                          </Link>
                          {/* Date de publication */}
                          <div className="text-white/50 !font-pompiere">
                            {dateToFr(wave.createdAt)}
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
                      {wave.image && (
                        <Zoom classDialog="custom-zoom">
                          <div>
                            <img
                              className="mx-auto max-h-[150px] max-w-[100%]"
                              src={wave.image}
                              alt="image publiée"
                            />
                          </div>
                        </Zoom>
                      )}
                    </div>

                    {/* Actions sous le message */}
                    <WaveInteraction user={user} wave={wave} />
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
          className="bg-black border  shadow-custom p-6 rounded  w-1/3 h-1/3 mx-auto mt-40"
          overlayClassName="fixed inset-0 z-10 bg-black/60 flex justify-center items-center"
          onRequestClose={() => setWavetoDelete(null)}
        >
          <div className="flex flex-col justify-evenly h-full items-center-safe">
            <p className="font-semibold">
              Voulez-vous vraiment supprimer ce post?{" "}
            </p>
            <div className="flex gap-10 items-center">
              {/* Bouton de confirmation de suppression */}
              <Button onClick={onDeleteClick} type="button">
                {isLoadingDelete ? (
                  <div>
                    Suppression en cours...
                    <ClipLoader size={10} color="white" />
                  </div>
                ) : (
                  "Valider"
                )}
              </Button>
              {/* Bouton d'annulation */}
              <Button onClick={() => setWavetoDelete(null)} type="button">
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

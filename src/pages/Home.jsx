/**
 * Page d'accueil principale de l'application.
 * Permet à l'utilisateur connecté de publier un message ("Wave"), de voir le fil d'actualité,
 * de répondre aux messages, de supprimer ses propres messages et d'interagir avec les publications.
 */

import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import WelcomeModal from "../components/WelcomeModal";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useCreateWave } from "../hooks/waves/useCreateWave";
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
import LikeButton from "../components/LikeButton";
import { useCounterLike } from "../hooks/waves/useCounterLike";

export default function Home() {
  // État pour afficher la modale de bienvenue si l'utilisateur n'a pas de pseudo
  const [showModal, setShowModal] = useState(false);
  // État pour gérer l'ouverture du formulaire de réponse à un message
  const [activeReplyId, setActiveReplyId] = useState(null);
  // État pour afficher ou masquer les réponses d'un message
  const [showReply, setShowReply] = useState(null);
  // État pour stocker le message à supprimer
  const [wavetoDelete, setWavetoDelete] = useState(null);

  // Récupération de l'utilisateur depuis le contexte global
  const { user } = useContext(UserContext);

  // Récupération de la liste des messages ("waves")
  const { data: waves = [] } = useWaves(null);

  // Hook pour créer un nouveau message
  const { mutate, isLoading } = useCreateWave(user?.uid, user?.pseudo);

  // Gestion du formulaire de création de message
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Hook pour supprimer un message
  const { mutate: mutateDeletePost, isLoading: isLoadingDelete } =
    useDeleteWave(null);

  /**
   * Ferme la modale de bienvenue
   */
  const handleCloseModal = () => {
    setShowModal(false);
  };

  /**
   * Soumission du formulaire de création de message
   * @param {object} data - Données du formulaire
   */
  const onSubmit = (data) => {
    if (isLoading) {
      return;
    }
    mutate(data, {
      onSuccess: () => {
        toast.success("Votre Wave a été publiée!");
        reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

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

  // Affiche la modale de bienvenue si l'utilisateur n'a pas encore de pseudo (première connexion)
  useEffect(() => {
    if (user && !user.pseudo) {
      setShowModal(true);
    }
  }, []);

  return (
    <>
      {/* Animation d'entrée de la page */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="container flex items-stretch"
      >
        {/* Modale de bienvenue si besoin */}
        {showModal && <WelcomeModal onCloseModal={handleCloseModal} />}

        {/* Colonne de gauche : publication d'un nouveau message */}
        <div className="flex flex-col justify-evenly px-16 border-r basis-1/3 shrink-0 border-gray-600 ">
          <div className="flex justify-center items-center text-gray-300  my-5 font-semibold !font-pompiere text-3xl">
            Avez vous quelque chose à partager aujourd'hui?{" "}
          </div>
          {/* Formulaire de publication */}
          <form
            onSubmit={handleSubmit(onSubmit, (errors) =>
              toast.error(errors.message.message)
            )}
          >
            <div className="flex flex-col gap-12 items-center">
              {/* Zone de texte pour le message */}
              <textarea
                className="border focus:border-2 focus:border-blue-600 outline-none rounded p-3 w-full"
                rows={10}
                placeholder="Ecrivez votre message..."
                {...register("message", {
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Vous ne pouvez pas envoyer une Wave vide!",
                })}
              ></textarea>
              {/* Bouton de publication */}
              <Button
                type="submit"
                disabled={isLoading}
                value={isLoading ? "Publication..." : "Publier"}
              />
            </div>
          </form>
        </div>

        {/* Colonne de droite : fil d'actualité */}
        <div className=" flex flex-col items-center py-5 px-16 gap-10 grow">
          {/* Titre du fil */}
          <h1
            className="text-center
       w-ful"
          >
            Fil d'actualités:
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
      </motion.div>

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

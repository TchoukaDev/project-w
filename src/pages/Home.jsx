/**
 * Page d'accueil principale de l'application.
 * Permet à l'utilisateur connecté de publier un message ("Wave"), de voir le fil d'actualité,
 * de répondre aux messages, de supprimer ses propres messages et d'interagir avec les publications.
 */

import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../contexts/userContext";
import WelcomeModal from "../components/WelcomeModal";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useCreateWave } from "../hooks/waves/useCreateWave";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, ChevronUp, X, ChevronDown, Smile } from "lucide-react";
import Modal from "react-modal";
import { useDeleteWave } from "../hooks/waves/useDeleteWave";
import { useReplies } from "../hooks/waves/useReplies";
import MakeReply from "../components/MakeReply";
import ShowReply from "../components/ShowReply";
import { useWaves } from "../hooks/waves/useWaves";
import { Link } from "react-router";
import LikeButton from "../components/LikeButton";
import Loader from "../components/Loader";
import { dateToFr } from "../utilities/functions";
import { ClipLoader } from "react-spinners";
import EmojiPicker from "emoji-picker-react";

export default function Home() {
  // État pour afficher la modale de bienvenue si l'utilisateur n'a pas de pseudo
  const [showModal, setShowModal] = useState(false);
  // État pour gérer l'ouverture du formulaire de réponse à un message
  const [activeReplyId, setActiveReplyId] = useState(null);
  // État pour afficher ou masquer les réponses d'un message
  const [showReply, setShowReply] = useState(null);
  // État pour stocker le message à supprimer
  const [wavetoDelete, setWavetoDelete] = useState(null);
  // Etat pour afficher ou masquer le picker d'emoji
  const [showEmoji, setShowEmoji] = useState(false);

  // Récupération de l'utilisateur depuis le contexte global
  const { user, loading: userLoading } = useContext(UserContext);

  // Récupération de la liste des messages ("waves")
  const { data: waves = [] } = useWaves(null);

  // Hook pour créer un nouveau message
  const { mutate, isLoading } = useCreateWave(
    user?.uid,
    user?.pseudo,
    user?.photo
  );

  // Référence pour accéder directement au DOM du textarea de Wave
  const waveContentRef = useRef(null);

  // Référence pour détecter les clics en dehors de la popup emoji
  const emojiRef = useRef();

  // Gestion du formulaire via react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Hook pour supprimer un message
  const { mutate: mutateDeletePost, isLoading: isLoadingDelete } =
    useDeleteWave(null);

  /**
   * Fusion des refs :
   * - react-hook-form a besoin d'une ref pour suivre l'élément et faire la validation
   * - on veut aussi garder une ref perso (waveContentRef) pour manipuler directement le DOM (ex: gestion curseur pour emoji)
   *
   * On récupère la ref de react-hook-form dans `registerRef` et le reste des props dans `registerRest`.
   * On crée la fonction `combinedRef` qui, à l'assignation du textarea DOM, affecte l'élément à
   * la fois à waveContentRef.current ET à la ref de react-hook-form.
   * Ainsi, on évite le conflit entre les deux refs et on garde toutes les fonctionnalités.
   */
  const { ref: registerRef, ...registerRest } = register("message", {
    validate: (value) =>
      value.trim().length > 0 || "Vous ne pouvez pas envoyer une Wave vide!",
  });

  // Fonction qui combine les deux refs (react-hook-form et waveContentRef)
  const combinedRef = (element) => {
    waveContentRef.current = element; // Notre ref perso
    registerRef(element); // ref react-hook-form
  };

  /**
   * Fonction pour insérer un emoji dans le textarea à la position actuelle du curseur
   * Elle utilise waveContentRef pour manipuler la sélection et le focus directement dans le DOM.
   */
  const insertEmoji = (emoji) => {
    // On récupère la référence vers le textarea via useRef
    const waveContent = waveContentRef.current;

    // Position du curseur ou début de la sélection dans le textarea
    // C'est un nombre entier qui indique l'index du caractère où commence la sélection
    // Si aucun texte n'est sélectionné, start correspond à la position actuelle du curseur
    const start = waveContent.selectionStart;

    // Position de la fin de la sélection dans le textarea
    // C'est un nombre entier indiquant l'index juste après le dernier caractère sélectionné
    // Si aucun texte n'est sélectionné, end est égal à start
    const end = waveContent.selectionEnd;

    // Texte actuel dans le textarea
    const currentText = waveContent.value;

    // Construction du nouveau texte après insertion de l'emoji
    // - On garde la partie avant la sélection/cursor : currentText.slice(0, start)
    // - On ajoute l'emoji sélectionné
    // - On ajoute la partie après la sélection : currentText.slice(end)
    // Cela remplace la sélection par l'emoji, ou insère l'emoji à la position du curseur
    const newText =
      currentText.slice(0, start) + emoji + currentText.slice(end);

    // Mise à jour de la valeur du champ "message" dans react-hook-form,
    // afin que le formulaire prenne en compte ce nouveau contenu
    setValue("message", newText);

    // Après la mise à jour du DOM (asynchrone),
    // on repositionne le curseur juste après l'emoji inséré
    setTimeout(() => {
      // On remet le focus sur le textarea (utile si on l'a perdu en cliquant sur l'emoji)
      waveContent.focus();

      // On positionne le curseur juste après l'emoji :
      // start correspond à la position où on a inséré l'emoji,
      // emoji.length correspond au nombre de caractères de l'emoji (souvent 2 pour les emojis complexes),
      // donc on place le curseur à start + emoji.length pour que la saisie reprenne après l'emoji
      waveContent.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Effet pour fermer la popup emoji si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ferme la modale de bienvenue
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Soumission du formulaire de création de message
  const onSubmit = (data) => {
    if (isLoading) return;
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

  // Suppression d'un message sélectionné
  const onDeleteClick = () => {
    if (isLoadingDelete) return;
    mutateDeletePost(wavetoDelete.wid, {
      onSuccess: () => toast.success("Votre Wave a été supprimé."),
      onError: (error) => toast.error(error.message),
    });
    setWavetoDelete(null);
  };

  // Ferme le formulaire de réponse
  const onCloseReviewForm = () => setActiveReplyId(false);

  // Affiche ou masque les réponses d'un message
  const onClickShowReplies = (id) => setShowReply(id);

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
  }, [user]);

  // Affiche un loader pendant le chargement des données utilisateur
  if (userLoading) return <Loader />;

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
          <div className="flex justify-center items-center text-gray-300 my-5 font-semibold !font-pompiere text-3xl">
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

              <div className=" w-full">
                <div>
                  <textarea
                    {...registerRest}
                    ref={combinedRef}
                    className="peer border border-b-0 focus:border-2 focus:border-b-0 focus:border-blue-600 outline-none rounded-t p-3 w-full resize-none"
                    rows={10}
                    placeholder="Ecrivez votre message..."
                  ></textarea>
                  <div className="w-full -mt-2 px-2 pt-2 border border-t-0 peer-focus:border-2 peer-focus:border-t-0 peer-focus:border-blue-600 ">
                    <button
                      type="button"
                      onClick={() => setShowEmoji((prev) => !prev)}
                      className=" hover:scale-110 transition "
                    >
                      <Smile className="text-gray-400 hover:cursor-pointer" />
                    </button>
                  </div>
                </div>

                {/* Popup emoji */}
                {showEmoji && (
                  <div ref={emojiRef} className="absolute z-50">
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={(emojiObject) => {
                        insertEmoji(emojiObject.emoji);
                        setShowEmoji(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bouton de publication */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div>
                    Publication...
                    <ClipLoader size={10} color="white" />
                  </div>
                ) : (
                  "Publier"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Colonne de droite : fil d'actualité */}
        <div className="flex flex-col items-center py-5 px-16 gap-10 grow">
          {/* Titre du fil */}
          <h1 className="text-center w-full">Fil d'actualités:</h1>
          {/* Liste des messages */}
          <div className="flex flex-col w-full">
            {waves?.length === 0 ? (
              // Aucun message à afficher
              <p className="flex flex-col justify-center text-xl items-center grow">
                Aucune actualité pour le moment.
              </p>
            ) : (
              // Affichage des messages triés par date décroissante
              [...waves]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((wave) => (
                  <div key={wave.wid} className="flex flex-col mb-6 relative">
                    {/* En-tête du message */}
                    <div className="flex flex-col gap-5 border border-gray-300/20 w-full rounded-t py-3 px-6">
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
                                className="w-[30px] rounded-full"
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
                    </div>

                    {/* Actions sous le message */}
                    <div className="bg-gray-900/40 p-1 rounded-b flex justify-evenly items-center">
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
                        className="hover:text-blue-600 hover:cursor-pointer text-xs flex gap-2 items-center text-gray-400 p-1 transition-colors duration-300"
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
          className="bg-black border shadow shadow-custom p-6 rounded w-1/3 h-1/3 mx-auto mt-40"
          overlayClassName="fixed inset-0 z-10 bg-black/60 flex justify-center items-center"
          onRequestClose={() => setWavetoDelete(null)}
        >
          <div className="flex flex-col justify-evenly h-full items-center-safe">
            <p className="font-semibold">
              Voulez-vous vraiment supprimer ce post?{" "}
            </p>
            <div className="flex gap-10 items-center">
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

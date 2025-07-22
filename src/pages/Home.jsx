import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../contexts/userContext";
import WelcomeModal from "../components/WelcomeModal";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useCreateWave } from "../hooks/waves/useCreateWave";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Smile, X, ChevronUp } from "lucide-react";
import Modal from "react-modal";
import { useDeleteWave } from "../hooks/waves/useDeleteWave";
import RepliesCount from "../components/RepliesCount";
import MakeReply from "../components/MakeReply";
import ShowReply from "../components/ShowReply";
import { useWaves } from "../hooks/waves/useWaves";
import { Link } from "react-router";
import LikeButton from "../components/LikeButton";
import Loader from "../components/Loader";
import { dateToFr, insertEmoji } from "../utilities/functions";
import { ClipLoader } from "react-spinners";
import EmojiPicker from "emoji-picker-react";
import { useClickOutside } from "../hooks/utilities/useClickOutside";

export default function Home() {
  // État pour afficher la modale de bienvenue si l'utilisateur n'a pas de pseudo
  const [showModal, setShowModal] = useState(false);

  // État pour gérer l'ouverture du formulaire de réponse à un message
  const [activeReplyId, setActiveReplyId] = useState(null);

  // État pour afficher ou masquer les réponses d'un message
  const [showReply, setShowReply] = useState(null);

  // État pour stocker le message à supprimer
  const [wavetoDelete, setWavetoDelete] = useState(null);

  // État pour afficher ou masquer le picker d'emojis
  const [showEmoji, setShowEmoji] = useState(false);

  // Récupère l'utilisateur via le contexte
  const { user, loading: userLoading } = useContext(UserContext);

  // Récupération des waves
  const { data: waves = [], isLoading: loadingWaves } = useWaves(null);

  // Hook de mutation pour créer une wave
  const { mutate, isLoading } = useCreateWave(
    user?.uid,
    user?.pseudo,
    user?.photo
  );

  // Référence au champ de texte du message
  const waveContentRef = useRef(null);

  // Références pour le picker d'emoji
  const emojiRef = useRef();
  const emojiBtnRef = useRef();

  // Fermer le picker emoji si clic en dehors
  useClickOutside(emojiRef, emojiBtnRef, () => {
    setShowEmoji(false);
  });

  // Références pour le formulaire de réponse
  const makeReplyRef = useRef();
  const makeReplyBtn = useRef();

  // Fonction de fermeture de de la fenetre de réponse si clic en dehors
  useClickOutside(makeReplyRef, makeReplyBtn, () => setActiveReplyId(false));

  // Références pour l'affichage des réponses
  const showReplyRef = useRef();
  const showReplyBtnRef = useRef();

  // Fonction de fermeture de la fenetre d'affichage des réponses si clic en dehors
  useClickOutside(showReplyRef, showReplyBtnRef, () => setShowReply(false));

  // Formulaire avec react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Hook de suppression de wave
  const { mutate: mutateDeletePost, isLoading: isLoadingDelete } =
    useDeleteWave(null);

  // Récupère les props du champ message
  const { ref: registerRef, ...registerRest } = register("message", {
    validate: (value) =>
      value.trim().length > 0 || "Vous ne pouvez pas envoyer une Wave vide!",
  });

  // Fonction qui combine la ref de react-hook-form et une ref perso
  const combinedRef = (element) => {
    waveContentRef.current = element;
    registerRef(element);
  };

  // Ferme la modale de bienvenue
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Soumission du formulaire
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

  // Suppression de la wave sélectionnée
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

  // Gère l'affichage des réponses à un message
  const onClickShowReplies = (id) => setShowReply(id);

  // Affiche la modale si l'utilisateur n'a pas encore de pseudo
  useEffect(() => {
    if (user && !user.pseudo) {
      setShowModal(true);
    }
  }, [user]);

  // Affiche un loader si les données sont encore en chargement
  if (userLoading || loadingWaves) return <Loader />;

  return (
    <>
      {/* Animation principale de la page */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="container flex flex-col lg:flex-row items-stretch"
      >
        {/* Modale de bienvenue */}
        {showModal && <WelcomeModal onCloseModal={handleCloseModal} />}

        {/* Colonne de gauche - création d'une Wave */}
        <div className="flex flex-col justify-evenly px-5 md:px-16 py-5 border-b lg:border-b-0 lg:border-r basis-1/3 shrink-0 border-gray-600 ">
          <div className="flex justify-center items-center text-gray-600 dark:text-gray-300 my-5 font-semibold !font-roboto underline text-2xl">
            Salut {user?.firstName || "toi"}!{" "}
          </div>
          <div className="flex justify-center items-center text-gray-600 dark:text-gray-300 my-7 font-semibold !font-roboto text-xl">
            Souhaites-tu partager quelque chose aujourd'hui?{" "}
          </div>

          {/* Formulaire de publication */}
          <form
            onSubmit={handleSubmit(onSubmit, (errors) =>
              toast.error(errors.message.message)
            )}
          >
            <div className="flex flex-col gap-12 items-center">
              {/* Zone de saisie du message */}
              <div className=" w-full">
                <div>
                  <textarea
                    {...registerRest}
                    ref={combinedRef}
                    className="peer border border-b-0 focus:border-2 focus:border-b-0 focus:border-blue-600 outline-none rounded-t p-3 w-full resize-none"
                    rows={5}
                    placeholder="Ecrivez votre message..."
                  ></textarea>
                  <div className="w-full -mt-2 px-2 pt-2 border border-t-0 peer-focus:border-2 peer-focus:border-t-0 peer-focus:border-blue-600 ">
                    <button
                      type="button"
                      ref={emojiBtnRef}
                      onClick={() => setShowEmoji((prev) => !prev)}
                      className=" hover:scale-110 transition "
                    >
                      <Smile className="text-gray-400 hover:cursor-pointer" />
                    </button>
                  </div>
                </div>

                {/* Popup emoji */}
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div ref={emojiRef} className="absolute z-50">
                      <EmojiPicker
                        className="max-h-[250px]"
                        theme="dark"
                        skinTonesDisabled={true}
                        searchDisabled={true}
                        previewConfig={{ showPreview: false }}
                        onEmojiClick={(emojiObject) => {
                          insertEmoji(
                            emojiObject.emoji,
                            waveContentRef,
                            setValue,
                            "message"
                          );
                          setShowEmoji(false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bouton de soumission */}
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

        {/* Colonne de droite - affichage des messages */}
        <div className="flex flex-col items-center py-5 px-5 mt-10 md:px-16 gap-10 grow">
          <h1 className="text-center w-full">Fil d'actualités:</h1>
          <div className="flex flex-col w-full">
            {loadingWaves ? (
              <p className="flex flex-col justify-center text-xl items-center grow">
                Chargement en cours...
                <ClipLoader color="blue" />
              </p>
            ) : waves?.length === 0 ? (
              <p className="flex flex-col justify-center text-xl items-center grow">
                Aucune actualité pour le moment.
              </p>
            ) : (
              [...waves]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((wave) => (
                  <div key={wave.wid} className="flex flex-col mb-6 relative">
                    {/* En-tête du message */}
                    <div className="flex flex-col gap-5 border border-gray-300 transition-all dark:border-gray-300/20 rounded-t py-3 px-6">
                      <div className="flex gap-5 items-center">
                        <div className="flex justify-between items-center grow">
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
                          <div className="text-white/50 !font-pompiere">
                            {dateToFr(wave.createdAt)}
                          </div>
                        </div>
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
                      <p>{wave.message}</p>
                    </div>

                    {/* Zone d'interaction : like, répondre, voir réponses */}
                    <div className="bg-gray-900/40 p-1 rounded-b flex justify-evenly items-center">
                      <LikeButton
                        uid={user.uid}
                        wid={wave.wid}
                        wuid={wave.uid}
                      />

                      <div
                        ref={makeReplyBtn}
                        onClick={() => {
                          if (showReply) {
                            setShowReply(null);
                          }
                          setActiveReplyId((prev) =>
                            prev === wave.wid ? null : wave.wid
                          );
                        }}
                        className="hover:text-blue-600 hover:cursor-pointer text-xs flex gap-2 items-center text-gray-600 dark:text-gray-400 p-1 transition-colors duration-300"
                      >
                        <p className="text-center">Répondre</p>
                        {activeReplyId === wave.wid ? (
                          <ChevronUp size={16} strokeWidth={2.75} />
                        ) : (
                          <Reply size={16} strokeWidth={2.75} />
                        )}
                      </div>

                      <AnimatePresence>
                        {activeReplyId === wave.wid && (
                          <MakeReply
                            ref={makeReplyRef}
                            wid={wave.wid}
                            onCloseReviewForm={onCloseReviewForm}
                          />
                        )}
                      </AnimatePresence>

                      <RepliesCount
                        ref={showReplyBtnRef}
                        showReply={showReply}
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

                    <AnimatePresence>
                      {showReply === wave.wid && (
                        <ShowReply ref={showReplyRef} wid={wave.wid} />
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
          className="bg-gray-600 border shadow-custom p-6 text-gray-200 dark:text-white rounded w-1/3 h-1/3 mx-auto mt-40"
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

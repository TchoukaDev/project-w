import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import WelcomeModal from "../components/WelcomeModal";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useCreateWave } from "../hooks/useCreateWave";
import { toast } from "react-toastify";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Reply, ThumbsUp, ChevronUp, X, ChevronDown } from "lucide-react";
import Modal from "react-modal";
import { useDeleteWave } from "../hooks/UseDeleteWave";
import { useReplies } from "../hooks/useReplies";
import MakeReply from "../components/MakeReply";
import ShowReply from "../components/ShowReply";
import { useWaves } from "../hooks/useWaves";
import { Link } from "react-router";

export default function Home() {
  // States
  const [showModal, setShowModal] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showReply, setShowReply] = useState(null);
  const [wavetoDelete, setWavetoDelete] = useState(null); //Récupérer wave à supprimer

  // Variables
  const { user } = useContext(UserContext);
  const { data: waves = [] } = useWaves(null);
  const { mutate, isLoading, error } = useCreateWave(user?.uid, user?.pseudo);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    mutate: mutateDeletePost,
    isLoading: isLoadingDelete,
    errors: errorDelete,
  } = useDeleteWave(null);

  // Functions
  const handleCloseModal = () => {
    setShowModal(false);
  };

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

  const onCloseReviewForm = () => {
    setActiveReplyId(false);
  };

  const onClickShowReplies = (id) => {
    setShowReply(id);
  };

  function RepliesCount({ wid, onClickShowReplies }) {
    const { data: replies = [] } = useReplies(wid);
    return (
      <div
        onClick={onClickShowReplies}
        className="hover:text-blue-600 hover:cursor-pointer text-xs text-gray-400 flex items-center gap-2"
      >
        💬 {replies.length} {replies.length === 1 ? "réponse" : "réponses"}{" "}
        {showReply === wid ? (
          <ChevronUp size={16} strokeWidth={2.75} />
        ) : (
          <ChevronDown size={16} strokeWidth={2.75} />
        )}
      </div>
    );
  }

  // UseEffect pour ouverture de la modale si pas de pseudo défini (1ère connexion)
  useEffect(() => {
    {
      if (user && !user.pseudo) {
        setShowModal(true);
      }
    }
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="container flex items-stretch"
      >
        {" "}
        {showModal && <WelcomeModal onCloseModal={handleCloseModal} />}
        <div className="flex flex-col justify-evenly px-16 border-r basis-1/3 shrink-0 border-gray-600 ">
          <div className="flex justify-center items-center text-gray-300  my-5 font-semibold !font-pompiere text-3xl">
            Avez vous quelque chose à partager aujourd'hui?{" "}
          </div>
          <form
            onSubmit={handleSubmit(onSubmit, (errors) =>
              toast.error(errors.message.message)
            )}
          >
            <div className="flex flex-col gap-12 items-center">
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
              <Button
                type="submit"
                disabled={isLoading}
                value={isLoading ? "Publication..." : "Publier"}
              />
            </div>
          </form>
        </div>
        <div className=" flex flex-col items-center py-5 px-16 gap-10 grow">
          <div
            className="text-center
       w-full underline font-semibold text-gray-300 text-3xl !font-pompiere"
          >
            Fil d'actualités:
          </div>
          <div className="flex flex-col w-full">
            {waves?.length == 0 ? (
              <p className=" flex flex-col justify-center text-xl  items-center grow">
                Aucune actualité pour le moment.
              </p>
            ) : (
              [...waves]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((wave) => (
                  <div key={wave.wid} className="flex flex-col mb-6 relative">
                    <div className=" flex flex-col gap-5 border border-gray-300/20 w-full rounded-t py-3 px-6">
                      {" "}
                      <div className="flex gap-5 items-center">
                        <div className="flex justify-between items-center grow">
                          <Link
                            className="underline text-xl text-blue-600 !font-pompiere"
                            to={`/profile/${wave.uid}`}
                          >
                            {" "}
                            {wave.pseudo}
                          </Link>

                          <div className="text-white/50 !font-pompiere">
                            {wave.createdAt}
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
                        )}{" "}
                      </div>
                      <p>{wave.message}</p>
                    </div>{" "}
                    <div className=" bg-gray-900/40  p-1 rounded-b flex justify-evenly items-center">
                      <button
                        type="button"
                        className="hover:text-blue-600 hover:cursor-pointer text-xs flex gap-2 items-center text-gray-400 p-1 transition-colors duration-300"
                      >
                        {" "}
                        <p>J'aime</p>
                        <ThumbsUp size={16} strokeWidth={2.75} />
                      </button>
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
                        {" "}
                        <p>Répondre</p>
                        {activeReplyId === wave.wid ? (
                          <ChevronUp size={16} strokeWidth={2.75} />
                        ) : (
                          <Reply size={16} strokeWidth={2.75} />
                        )}
                      </div>
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
                    <AnimatePresence>
                      {showReply === wave.wid && <ShowReply wid={wave.wid} />}
                    </AnimatePresence>
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

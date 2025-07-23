import { useRef, useState } from "react";
import { useClickOutside } from "../hooks/utilities/useClickOutside";
import { AnimatePresence } from "framer-motion";
import MakeReply from "./MakeReply";
import { ChevronUp, Reply } from "lucide-react";
import LikeButton from "./LikeButton";
import ShowReply from "./ShowReply";
import RepliesCount from "./RepliesCount";

export default function WaveInteraction({ user, wave }) {
  // État pour gérer l'ouverture du formulaire de réponse à un message
  const [activeReplyId, setActiveReplyId] = useState(null);

  // État pour afficher ou masquer les réponses d'un message
  const [showReply, setShowReply] = useState(null);

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

  // Ferme le formulaire de réponse
  const onCloseReviewForm = () => setActiveReplyId(false);

  // Gère l'affichage des réponses à un message
  const onClickShowReplies = (id) => setShowReply(id);

  return (
    <>
      <div className=" bg-gray-900/40  p-1 rounded-b flex justify-evenly items-center">
        {/* Bouton "J'aime" */}
        <LikeButton uid={user.uid} wid={wave.wid} wuid={wave.uid} />
        {/* Bouton pour répondre */}
        <div
          ref={makeReplyBtn}
          onClick={() => {
            if (showReply) {
              setShowReply(null);
            }
            setActiveReplyId((prev) => (prev === wave.wid ? null : wave.wid));
          }}
          className="hover:text-blue-600 hover:cursor-pointer text-xs flex gap-2 items-center  text-gray-400 p-1 transition-colors duration-300"
        >
          <p>Répondre</p>
          {activeReplyId === wave.wid ? (
            <ChevronUp size={16} strokeWidth={2.75} />
          ) : (
            <Reply size={16} strokeWidth={2.75} />
          )}
        </div>{" "}
        {/* Affichage du formulaire de réponse si demandé */}
        <AnimatePresence>
          {activeReplyId === wave.wid && (
            <MakeReply
              ref={makeReplyRef}
              wid={wave.wid}
              onCloseReviewForm={onCloseReviewForm}
            />
          )}
        </AnimatePresence>
        {/* Affichage du nombre de réponses */}
        <RepliesCount
          ref={showReplyBtnRef}
          showReply={showReply}
          onClickShowReplies={() => {
            if (activeReplyId) {
              setActiveReplyId(null);
            }
            onClickShowReplies((prev) => (prev === wave.wid ? null : wave.wid));
          }}
          wid={wave.wid}
        />
      </div>
      {/* Affichage des réponses si demandé */}
      <AnimatePresence>
        {showReply === wave.wid && (
          <ShowReply ref={showReplyRef} wid={wave.wid} />
        )}
      </AnimatePresence>
    </>
  );
}

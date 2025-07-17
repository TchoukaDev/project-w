import { motion } from "framer-motion";
import { useReplies } from "../hooks/waves/useReplies";
import { useRef } from "react";
import { useClickOutside } from "../hooks/utilities/useClickOutside";

export default function ShowReply({ wid, onClose }) {
  const { data: replies = [], isLoading, error } = useReplies(wid);

  const showReplyRef = useRef();
  // Hook pour fermer les commentaires quand on clique en dehors
  useClickOutside(showReplyRef, null, onClose);
  return (
    <motion.div
      key={wid}
      ref={showReplyRef}
      className="absolute border border-gray-600 flex flex-col gap-5 max-h-[400px] overflow-auto bg-gray-800 z-1 p-3 top-full mt-1 w-full rounded"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {replies?.length === 0 ? (
        <div className="text-center text-sm text-gray-300">
          Aucun commentaire pour l'instant
        </div>
      ) : (
        [...replies]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((reply) => (
            <div
              key={reply.rid}
              className="flex border border-gray-700 rounded flex-col px-5 gap-3 p-3"
            >
              <div className="flex text-lg  gap-4  text-gray-400/70 ">
                <div className="text-blue-600 underline !font-pompiere">
                  {reply.pseudo}
                </div>
                <div className="!font-pompiere">{reply.createdAt}</div>
              </div>
              <p className="text-sm text-gray-300">{reply.reply}</p>
            </div>
          ))
      )}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useReplies } from "../hooks/useReplies";

export default function ShowReply({ wid, onClose }) {
  const { data: replies = [], isLoading, error } = useReplies(wid);
  console.log(replies);
  return (
    <motion.div
      key={wid}
      className="absolute border border-gray-600 flex flex-col gap-5 max-h-[400px] overflow-auto bg-gray-800 z-1 p-3 top-full mt-1 w-full rounded"
      onClick={onClose}
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
        replies.map((reply) => (
          <div className="flex border border-gray-700 rounded flex-col px-5 gap-3 p-3">
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

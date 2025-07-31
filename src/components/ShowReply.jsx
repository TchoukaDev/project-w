import { motion } from "framer-motion";
import { useReplies } from "../hooks/waves/useReplies";
import { forwardRef } from "react";
import { Link } from "react-router";

const ShowReply = forwardRef(function ShowReply({ wid }, showReplyRef) {
  // Appel du hook personnalisé pour récupérer les réponses associées à un identifiant de publication (wid)
  const { data: replies = [], isLoading, error } = useReplies(wid);

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
        // Affichage si aucune réponse n'est trouvée
        <div className="text-center text-sm text-gray-300">
          Aucun commentaire pour l'instant
        </div>
      ) : (
        // Affichage des réponses triées par date décroissante
        [...replies]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((reply) => (
            <div
              key={reply.rid}
              className="flex border border-gray-700 rounded flex-col px-5 gap-3 p-3"
            >
              {/* Pseudo et date de création */}
              <div className="flex text-lg gap-4 text-gray-400/70">
                <Link
                  to={`/profile/${reply.pseudo}`}
                  className="text-blue-600 underline !font-pompiere"
                >
                  {reply.pseudo}
                </Link>
                <div className="!font-pompiere">{reply.createdAt}</div>
              </div>
              {/* Contenu de la réponse */}
              <p className="text-sm text-gray-300">{reply.reply}</p>
            </div>
          ))
      )}
    </motion.div>
  );
});

export default ShowReply;

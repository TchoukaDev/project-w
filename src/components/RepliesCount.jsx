import { forwardRef } from "react";
import { useReplies } from "../hooks/waves/useReplies";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Composant interne pour afficher le nombre de réponses à un message
 */
const RepliesCount = forwardRef(function RepliesCount(
  { wid, onClickShowReplies, showReply },
  showReplyBtnRef
) {
  const { data: replies = [] } = useReplies(wid);
  return (
    <div
      ref={showReplyBtnRef}
      onClick={onClickShowReplies}
      className="hover:text-blue-600 hover:cursor-pointer shrink-0 text-xs text-center dark:text-gray-400 flex items-center gap-2"
    >
      {/* Affiche le nombre de réponses */}
      💬 {replies.length} {replies.length <= 1 ? "réponse" : "réponses"}{" "}
      {showReply === wid ? (
        <ChevronUp size={16} strokeWidth={2.75} />
      ) : (
        <ChevronDown size={16} strokeWidth={2.75} />
      )}
    </div>
  );
});
export default RepliesCount;

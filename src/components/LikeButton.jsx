import { ThumbsUp } from "lucide-react";
import { useLike } from "../hooks/waves/useLike";
import { useToggleLike } from "../hooks/waves/useToggleLike";
import { useCounterLike } from "../hooks/waves/useCounterLike";

// Bouton pour liker/deliker
export default function LikeButton({ wid, uid, wuid }) {
  const { data: liked, loadingLikes } = useLike(wid, uid);
  const { mutate: toggleLike, isLoading } = useToggleLike(wid, uid);
  const { data: counterLike, isLoading: counterLoading } = useCounterLike(wid);

  return wuid === uid ? (
    <span className="text-xs text-center dark:text-gray-400">
      Nombre de like ({counterLike ?? 0})
    </span>
  ) : (
    <button
      onClick={() => toggleLike(liked)}
      disabled={loadingLikes || isLoading}
      className={`hover:text-blue-600 hover:cursor-pointer text-center text-xs flex gap-2 items-center  p-1 transition-colors duration-300 ${
        liked
          ? "text-blue-800 dark:text-blue-600"
          : "text-gray-600: dark:text-gray-400"
      }`}
    >
      {" "}
      {liked ? "Liked! " : "Mettre un like "}({counterLike})
      <ThumbsUp size={16} strokeWidth={2.75} />
    </button>
  );
}

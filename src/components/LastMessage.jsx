import { useContext } from "react";
import { UserContext } from "../contexts/userContext";
import Loader from "./Loader";
import useMarkToRead from "../hooks/messages/useMarkToRead";

import { useUserById } from "../hooks/users/useUserById";
import { Link } from "react-router";
import { dateToFr } from "../utilities/functions";
export default function LastMessage({ conversation }) {
  // Récupération de l'utilisateur
  const { user, loading } = useContext(UserContext);
  // Marquer un message comme lu au clic
  const { mutate: markToRead, isLoading } = useMarkToRead(
    user?.id,
    conversation?.id
  );
  // Récupération du statut de lecture du dernier message

  // Récupération du pseudo de l'autre utilisateur
  const participants = Object.keys(conversation?.participants);
  const otherUserId = participants.filter(
    (participant) => participant !== user.id
  );
  const { data: otherUser, isLoading: otherUserLoading } =
    useUserById(otherUserId);

  if (loading) {
    return <Loader />;
  }
  return (
    <Link
      to={`/messages/${otherUser?.pseudo}`}
      className={`cursor-pointer border w-1/1 lg:w-3/4 py-4 px-2 md:px-12 max-h-[150px] h-fit md:max-h-[100px] overflow-hidden rounded my-1 border-gray-500 relative ${
        !conversation.hasUnread ? "" : "bg-gray-600/20"
      }`}
      disabled={isLoading}
      onClick={() => markToRead(conversation.hasUnread)}
    >
      <div className=" flex items-center gap-3 underline font-semibold mb-3">
        {/* Photo utilisateur */}
        <img
          src={otherUser?.photo}
          alt="photo de profil"
          className="rounded-full max-w-[30px] max-h-[30px]"
        />
        <div
          className={`flex justify-between w-full ${
            !conversation.hasUnread
              ? "text-gray-400"
              : "text-gray-600 dark:text-white"
          }`}
        >
          {/* Nom utilisateur */}
          <div className="grow">{otherUser?.pseudo} </div>
          <div>{dateToFr(conversation?.lastMessage.timestamp)}</div>
        </div>
      </div>
      <div
        className={`ms-12 ${
          !conversation.hasUnread
            ? "text-gray-400"
            : "text-gray-600 dark:text-white"
        } max-w-1/1 max-h-1/1  break-words whitespace-pre-wrap line-clamp-1 overflow-hidden`}
      >
        {/* Si le message n'est pas vide, on affiche le message */}
        {conversation?.lastMessage.message.trim() !== "" &&
          conversation?.lastMessage.message}{" "}
        {/* Si le message est vide est qu'il contient juste une image, on affiche le lien de */}
        {conversation?.lastMessage.message.trim() == "" &&
          conversation?.lastMessage.image && (
            <span> {otherUser?.pseudo} vous a envoyé une image</span>
          )}{" "}
      </div>
      {/* Point de notification de novueau message */}
      {conversation.hasUnread && (
        <div className="w-[15px] h-[15px]  absolute right-3 top-1 rounded-full bg-red-600"></div>
      )}
    </Link>
  );
}

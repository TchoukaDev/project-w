import { useContext } from "react";
import { UserContext } from "../contexts/userContext";
import { motion } from "framer-motion";
import useConversationsByUser from "../hooks/messages/useConversationsByUser";
import Loader from "../components/Loader";
import LastMessage from "../components/LastMessage";

export default function Messages() {
  // Récupération de l'utilisateur
  const { user, loading: loadingUser } = useContext(UserContext);
  //Récupération des conversations de l'utilisateur
  const { data: conversations = [], isLoading: conversationLoading } =
    useConversationsByUser(user?.uid);
  if (loadingUser || conversationLoading) {
    return <Loader />;
  }
  return (
    <motion.main
      className="container flex-col items-center flex px-4 md:px-16 py-8"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="mb-16">Vos conversations:</h1>
      {conversations?.length === 0 ? (
        <p className="text-center self-center text-gray-600 dark:text-gray-300">
          Vous n'avez encore échangé aucun message avec cet utilisateur{" "}
        </p>
      ) : (
        conversations?.map((conversation) => (
          <LastMessage conversation={conversation} key={conversation.id} />
        ))
      )}
    </motion.main>
  );
}

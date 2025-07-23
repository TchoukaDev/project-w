import { useParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { insertEmoji } from "../utilities/functions";
import { UserContext } from "../contexts/userContext";
import { ClipLoader } from "react-spinners";
import { Smile } from "lucide-react";
import Button from "../components/Button";
import { useClickOutside } from "../hooks/utilities/useClickOutside";
import { useUserByPseudo } from "../hooks/users/useUserByPseudo";
import { useSendMessage } from "../hooks/messages/useSendMessage";
import { usePrivateMessages } from "../hooks/messages/usePrivateMessages";

export default function Conversation() {
  // État pour l'emoji Picker
  const [showEmoji, setShowEmoji] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupération du pseudo de l'URL
  const { pseudo } = useParams();

  // Récupération des informations des utilisateurs
  const { data: otherUser, isLoading: otherUserLoading } =
    useUserByPseudo(pseudo);

  const { user, loading: userLoading } = useContext(UserContext);

  // Fonction de mutation pour l'envoi des message
  const { mutate, isLoading: mutateLoading } = useSendMessage(
    user?.id,
    otherUser?.uid
  );

  const { data: messages = [], isLoading: messagesLoading } =
    usePrivateMessages(user?.id, otherUser?.uid);

  // Utilisation React Hook Form
  const { register, handleSubmit, reset, setValue } = useForm();

  const { ref: registerRef, ...registerRest } = register("message", {
    required: true,
  });

  // Références
  const emojiRef = useRef();
  const emojiBtnRef = useRef();
  const messageContentRef = useRef();

  // Référence combinée du champ du message
  const combinedRef = (element) => {
    messageContentRef.current = element;
    registerRef(element);
  };

  // Soumission du formulaire
  const onSubmit = (data) => {
    if (mutateLoading) return;
    const message = data.message;
    reset();
    mutate(data, {
      onError: (error) => {
        toast.error(error.message);
        setValue("message", message);
      },
    });
  };

  // Validation du message en appuyant sur touche Enter
  const submitForm = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Eviter envoi vide
      if (!messageContentRef.current?.value.trim()) return;

      // On définit data manuellement
      const data = { message: messageContentRef.current.value };
      e.preventDefault();
      handleSubmit(onSubmit(data));
    }
  };

  // Fermer le picker emoji si clic en dehors
  useClickOutside(emojiRef, emojiBtnRef, () => {
    setShowEmoji(false);
  });

  // Focus sur le champ de message
  useEffect(() => {
    messageContentRef.current?.focus();
  }, []);

  if (userLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.main
      className="container h-full flex flex-col p-15"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {" "}
      <div className="grow">
        Messages:
        {messages.map((message) => (
          <p key={message.id}>{message.message}</p>
        ))}
      </div>
      <div>
        {" "}
        {/* Formulaire */}
        <form
          onSubmit={handleSubmit(onSubmit, (errors) =>
            toast.error(errors.message.message)
          )}
        >
          <div className="flex flex-col gap-12 items-center">
            {/* Zone de saisie du message */}
            <div className=" w-full">
              <div
                className="cursor-text"
                onClick={() => messageContentRef.current.focus()}
              >
                <textarea
                  disabled={mutateLoading}
                  {...registerRest}
                  ref={combinedRef}
                  className="peer border border-b-0 focus:border-2 focus:border-b-0 focus:border-blue-600 outline-none rounded-t p-3 w-full resize-none"
                  rows={1}
                  placeholder="Ecrivez votre message..."
                  onKeyDown={submitForm}
                ></textarea>
                <div className="w-full -mt-2 px-2 pt-2 border border-t-0 peer-focus:border-2 rounded-b peer-focus:border-t-0 peer-focus:border-blue-600 ">
                  {" "}
                  <div className="relative">
                    <button
                      type="button"
                      ref={emojiBtnRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmoji((prev) => !prev);
                      }}
                      className=" hover:scale-110 transition "
                    >
                      <Smile className="text-gray-400 hover:cursor-pointer" />
                    </button>{" "}
                    {/* Popup emoji */}
                    <AnimatePresence>
                      {showEmoji && (
                        <motion.div
                          ref={emojiRef}
                          className="absolute bottom-full mb-2 z-50"
                        >
                          <EmojiPicker
                            theme="dark"
                            skinTonesDisabled={true}
                            searchDisabled={true}
                            previewConfig={{ showPreview: false }}
                            onEmojiClick={(emojiObject) => {
                              insertEmoji(
                                emojiObject.emoji,
                                messageContentRef,
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
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <Button type="submit" disabled={mutateLoading}>
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
    </motion.main>
  );
}

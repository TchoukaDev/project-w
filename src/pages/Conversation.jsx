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

export default function Conversation() {
  // État pour l'emoji Picker
  const [showEmoji, setShowEmoji] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupération du pseudo de l'URL
  const { pseudo } = useParams();
  const { data: otherUser, isLoading: otherUserLoading } =
    useUserByPseudo(pseudo);

  const { user, loading: userLoading } = useContext(UserContext);

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
    if (isLoading) return;
    mutate(data, {
      onSuccess: () => {
        reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
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
      <div className="grow">Messages</div>
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
                  {...registerRest}
                  ref={combinedRef}
                  className="peer border border-b-0 focus:border-2 focus:border-b-0 focus:border-blue-600 outline-none rounded-t p-3 w-full resize-none"
                  rows={1}
                  placeholder="Ecrivez votre message..."
                ></textarea>
                <div className="w-full -mt-2 px-2 pt-2 border border-t-0 peer-focus:border-2 peer-focus:border-t-0 peer-focus:border-blue-600 ">
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
            <Button type="submit" disabled={isLoading}>
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

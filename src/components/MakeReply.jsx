import { useForm } from "react-hook-form";
import { useReplies } from "../hooks/waves/useReplies";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateReply } from "../hooks/waves/useCreateReply";
import { toast } from "react-toastify";
import { useContext, useRef, useState, useEffect } from "react";
import { UserContext } from "../contexts/userContext";
import Button from "./Button";
import { ClipLoader } from "react-spinners";
import { insertEmoji } from "../utilities/functions";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MakeReply({ wid, onCloseReviewForm }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [mountEmoji, setMountEmoji] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const { user } = useContext(UserContext);
  const { data: replies = [], isLoading, error } = useReplies(wid);
  const { mutate, isLoading: mutateLoading } = useCreateReply(
    wid,
    user.uid,
    user.pseudo
  );

  const { ref: registerRef, ...registerRest } = register("reply");

  const replyRef = useRef(null);
  const emojiRef = useRef();
  const emojiBtnRef = useRef();

  // Fusion des refs useRef et registerRef
  const replyCombinedRef = (element) => {
    replyRef.current = element;
    registerRef(element);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Monter le Picker une fois que le composant est monté pour éviter bug d'animation
  useEffect(() => {
    setMountEmoji(true);
  }, []);

  const onSubmit = (data) => {
    if (isLoading || mutateLoading) {
      return;
    }
    mutate(data, {
      onSuccess: () => {
        toast.success("Votre réponse a été envoyée.");
        onCloseReviewForm();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
    reset();
  };

  return (
    <motion.form
      key={wid}
      className="absolute bg-gray-800 p-3 border border-gray-600 top-full z-1 mt-1 w-full rounded"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <textarea
          ref={replyCombinedRef}
          {...registerRest}
          rows={10}
          placeholder="Votre réponse..."
          className="peer w-full border border-b-0 p-2 rounded outline-0 focus:border-2 focus:border-b-0 focus:border-blue-600 text-sm resize-none"
        />{" "}
        <div className=" w-full -mt-2 px-2 pt-2 border border-t-0 peer-focus:border-2 peer-focus:border-t-0 peer-focus:border-blue-600 ">
          <button
            type="button"
            ref={emojiBtnRef}
            onClick={() => setShowEmoji((prev) => !prev)}
            className=" hover:scale-110 transition "
          >
            <Smile className="text-gray-400 hover:cursor-pointer" />
          </button>
        </div>
      </div>
      {showEmoji && mountEmoji && (
        <motion.div
          ref={emojiRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute z-50"
        >
          <EmojiPicker
            theme="dark"
            skinTonesDisabled={true}
            searchDisabled={true}
            previewConfig={{ showPreview: false }}
            onEmojiClick={(emojiObject) => {
              insertEmoji(emojiObject.emoji, replyRef, setValue, "reply");
              setShowEmoji(false);
            }}
          />
        </motion.div>
      )}
      <p className="text-center">
        <Button margin={"mt-3"} type="submit">
          {isLoading || mutateLoading ? (
            <ClipLoader size={10} color="white" />
          ) : (
            "Envoyer"
          )}
        </Button>
      </p>
    </motion.form>
  );
}

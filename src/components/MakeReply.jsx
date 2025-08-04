import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateReply } from "../hooks/waves/useCreateReply";
import { toast } from "react-toastify";
import { useContext, useRef, useState, useEffect, forwardRef } from "react";
import { UserContext } from "../contexts/userContext";
import Button from "./Button";
import { ClipLoader } from "react-spinners";
import { insertEmoji } from "../utilities/functions";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useClickOutside } from "../hooks/utilities/useClickOutside";

const MakeReply = forwardRef(function MakeReply(
  { wid, onCloseReviewForm },
  makeReplyRef
) {
  const [showEmoji, setShowEmoji] = useState(false); // Affiche ou masque le picker d'emojis
  const [mountEmoji, setMountEmoji] = useState(false); // Permet de monter le picker après chargement pour éviter les bugs visuels

  // Configuration du formulaire via react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const { user } = useContext(UserContext); // Récupération de l'utilisateur connecté via le contexte
  const { mutate, isLoading: mutateLoading } = useCreateReply(
    wid,
    user.uid,
    user.pseudo
  ); // Hook personnalisé pour envoyer la réponse (mutation)

  // On sépare la référence du champ "reply"
  const { ref: registerRef, ...registerRest } = register("reply", {
    required:
      "Vous ne pouvez pas envoyer une réponse vide, veuillez saisir un message",
  });
  const onInvalid = (errors) => {
    if (errors.reply) {
      toast.error(errors.reply.message); // Affiche le message de validation
    }
  };

  const replyRef = useRef(null); // Référence au textarea
  const emojiRef = useRef(); // Référence au composant EmojiPicker
  const emojiBtnRef = useRef(); // Référence au bouton émoji

  // Ferme le picker d'emojis si on clique en dehors
  useClickOutside(emojiRef, emojiBtnRef, () => {
    setShowEmoji(false);
  });

  // Combine la ref React Hook Form et la ref locale pour le textarea
  const replyCombinedRef = (element) => {
    replyRef.current = element;
    registerRef(element);
  };

  // Permet de monter le picker d'émoji une fois que le composant est prêt (évite bugs d'animation)
  useEffect(() => {
    setMountEmoji(true);
  }, []);

  // Fonction exécutée lors de la soumission du formulaire
  const onSubmit = (data) => {
    if (mutateLoading) {
      return; // Évite une double soumission si la requête est en cours
    }
    onCloseReviewForm(); // Ferme le formulaire après envoi
    // Envoie des données via la mutation
    mutate(data, {
      onSuccess: () => {
        toast.success("Votre réponse a été envoyée."); // Message de succès
      },
      onError: (error) => {
        toast.error(error.message); // Message d'erreur
      },
    });

    reset(); // Réinitialise le formulaire
  };

  return (
    <motion.form
      ref={makeReplyRef} // Référence transmise au formulaire
      key={wid} // Clé unique liée à l'identifiant du message
      className="absolute bg-gray-800 p-3 border border-gray-600 top-full z-1 mt-1 w-full rounded"
      onSubmit={handleSubmit(onSubmit, onInvalid)} // Appelle handleSubmit avec notre fonction onSubmit
      initial={{ opacity: 0, y: -10 }} // Animation d'entrée
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} // Animation de sortie
      transition={{ duration: 0.2 }}
    >
      <div>
        <textarea
          ref={replyCombinedRef} // Combine la ref RHF et notre ref locale
          {...registerRest} // Règles de validation (aucune ici)
          rows={2}
          placeholder="Votre réponse..."
          className="peer w-full border border-b-0 p-2 rounded-t outline-0 focus:border-2 placeholder:text-gray-300 dark:text-white focus:border-b-0 focus:border-blue-600 text-sm resize-none"
        />
        <div className=" w-full -mt-2 px-2 pt-2 border border-t-0 rounded-b peer-focus:border-2 peer-focus:border-t-0 peer-focus:border-blue-600 ">
          <div className="relative">
            <button
              type="button"
              ref={emojiBtnRef} // Réf. pour détecter les clics hors du bouton
              onClick={() => setShowEmoji((prev) => !prev)} // Bascule l'affichage du picker
              className=" hover:scale-110 transition "
            >
              <Smile className="text-gray-400 hover:cursor-pointer" />{" "}
              {/* Icône smiley */}
            </button>
          </div>
        </div>

        {/* Affiche le picker d'emoji avec animation */}
        <AnimatePresence>
          {showEmoji && mountEmoji && (
            <motion.div
              className="absolute bottom-full left-0 mb-2 z-50"
              y
              ref={emojiRef} // Ref. pour détecter les clics extérieurs
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmojiPicker
                theme="dark"
                width={"100%"}
                skinTonesDisabled={true}
                searchDisabled={true}
                previewConfig={{ showPreview: false }}
                onEmojiClick={(emojiObject) => {
                  // Insère l'emoji à la position actuelle du curseur
                  insertEmoji(emojiObject.emoji, replyRef, setValue, "reply");
                  setShowEmoji(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Bouton d’envoi */}
      <p className="text-center">
        <Button margin={"mt-3"} type="submit">
          {mutateLoading ? (
            <ClipLoader size={10} color="white" /> // Affiche un loader si la mutation est en cours
          ) : (
            "Envoyer"
          )}
        </Button>
      </p>
    </motion.form>
  );
});
export default MakeReply;

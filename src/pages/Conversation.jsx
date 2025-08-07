import { Link, useParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { getConversationId, insertEmoji } from "../utilities/functions";
import { UserContext } from "../contexts/userContext";
import { ClipLoader } from "react-spinners";
import {
  ArrowLeft,
  CircleX,
  DownloadIcon,
  ImagePlus,
  Send,
  Smile,
} from "lucide-react";
import Loader from "../components/Loader";
import { useClickOutside } from "../hooks/utilities/useClickOutside";
import { useUserByPseudo } from "../hooks/users/useUserByPseudo";
import { useSendMessage } from "../hooks/messages/useSendMessage";
import { usePrivateMessages } from "../hooks/messages/usePrivateMessages";
import Button from "../components/Button";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import useMarkToRead from "../hooks/messages/useMarkToRead";
import { useConversationById } from "../hooks/messages/useConversationById";

export default function Conversation() {
  // État local pour la prévisualisation de l'image
  const [preview, setPreview] = useState(null);

  // Fichier sélectionné par l'utilisateur
  const [selectedFile, setSelectedFile] = useState(null);

  // État pour l'emoji Picker
  const [showEmoji, setShowEmoji] = useState(false);

  // Récupération du pseudo de l'URL
  const { pseudo } = useParams();

  // Récupération des informations des utilisateurs
  const { data: otherUser = [], isLoading: otherUserLoading } =
    useUserByPseudo(pseudo);
  const { user, loading: userLoading } = useContext(UserContext);

  // Récupération id de la conversation
  const conversationId = getConversationId(user?.id, otherUser?.uid);

  const { data: conversation = [] } = useConversationById(conversationId);

  // Fonction de mutation pour l'envoi des messages
  const { mutate, isLoading: mutateLoading } = useSendMessage(
    user?.id,
    otherUser?.uid
  );

  const { mutate: markToRead } = useMarkToRead(user?.id, conversationId);

  // Récupération des messages
  const { data: messages = [], isLoading: messagesLoading } =
    usePrivateMessages(user?.id, otherUser?.uid);

  // UssEffect pour marquer le dernier message comme lu à chaque fois qu'il change, si l'utilisateur est déjà dans la conversation
  useEffect(() => {
    if (
      conversation?.lastMessage &&
      !conversation.lastMessage.readBy?.[user?.id]
    ) {
      markToRead(true);
    }
  }, [conversation?.lastMessage, user?.id]);

  // Utilisation React Hook Form
  const { register, handleSubmit, reset, setValue } = useForm();
  const { ref: registerRef, ...registerRest } = register("message", {
    validate: (value) =>
      value.trim() !== "" ||
      selectedFile !== null ||
      "Veuillez saisir un message ou choisir un fichier",
  });

  // Références
  const emojiRef = useRef();
  const emojiBtnRef = useRef();
  const messageContentRef = useRef();
  const scrollMessagesRef = useRef(); //Référence pour le bas de la page des messages pour le scroll auto
  const fileRef = useRef(); // Référence pour l'input de chargement d'image (pour pouvoir le vider)

  // Référence combinée du champ du message
  const combinedRef = (element) => {
    messageContentRef.current = element;
    registerRef(element);
  };

  // Met à jour le fichier sélectionné dans l'état
  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Affiche un aperçu temporaire de l'image sélectionnée (avant upload)
  const showPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Récupérer la base url selon l'environnement
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8000/backend"
      : "https://waves.romainwirth.fr/backend");

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch(`${baseUrl}/uploads.php`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement de la photo");
    }

    const data = await response.json();

    return data.url;
  };

  // Reset du champ File
  const resetFile = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data) => {
    if (mutateLoading) return;

    let url = null;
    let completeData = data;
    const message = data.message;

    // Si un fichier est chargé, on récupère son url
    try {
      if (selectedFile) {
        url = await uploadFile("image", selectedFile);
      }
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    }
    // On modifie les données
    completeData = {
      ...data,
      image: url,
    };

    reset();
    resetFile();
    autoScrolltoBottom();
    mutate(completeData, {
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
      if (!messageContentRef.current?.value.trim() && !selectedFile) return;

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

  // fonction pour scroll auto intégrée lors de l'envoi d'un message
  const autoScrolltoBottom = () => {
    // s'assurer que le DOM a fini de se mettre à jour
    setTimeout(() => {
      if (scrollMessagesRef.current) {
        // On fait défiler le conteneur vers le bas (scrollHeight correspond à la hauteur totale du contenu)
        // Avec un défilement fluide grâce à 'behavior: "smooth"'
        scrollMessagesRef.current.scrollTo({
          top: scrollMessagesRef.current.scrollHeight, // position verticale finale du scroll (tout en bas)
          behavior: "smooth", // animation fluide du scroll
        });
      }
    }, 100);
  };

  if (userLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.main
      className="container !h-[120vh] flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-gray-500 hover:scrollbar-track-gray-200 lg:flex-row"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Colonne de gauche */}
      <div className="lg:basis-1/3 flex flex-col items-center gap-5 lg:gap-16 px-16 py-5 border-r border-gray-600">
        {" "}
        {/* Retour */}
        <Link
          className="hover:text-blue-600 text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300 flex items-center self-start"
          to="/messages"
        >
          <ArrowLeft /> Retour aux messages
        </Link>
        {/* Version desktop */}
        <div className="hidden lg:flex flex-col gap-5 items-center justify-evenly grow">
          {/* Titre */}
          <h1 className="text-center">
            Votre conversation avec {otherUser?.pseudo}:
          </h1>{" "}
          {/* Infos autre utilisateurs */}
          <div className="flex flex-col gap-10 items-center ">
            <img
              src={otherUser?.photo}
              referrerPolicy="no-referrer"
              alt="Photo de profil"
              className=" w-[50px] lg:w-[150px] h-[50px] lg:h-[150px] rounded-full"
            ></img>
            <Link to={`/profile/${otherUser?.pseudo}`}>
              <Button type="button">Voir le profil</Button>
            </Link>
          </div>
        </div>
        {/* Version mobile */}
        <div className="flex lg:hidden">
          <div className="font-semibold text-gray-900 dark:text-gray-300 text-md lg:text-2xl !font-inter text-center">
            Votre conversation avec{" "}
            <Link
              to={`/profile/${otherUser?.pseudo}`}
              className=" text-blue-600 underline hover:text-gray-600 dark:hover:text-gray-300"
            >
              {otherUser?.pseudo}
            </Link>{" "}
            :{/* Infos autre utilisateurs */}
          </div>
        </div>
      </div>

      {/* Colonne de droite */}
      <div className="flex flex-col relative  w-full lg:w-2/3 basis-2/3 gap-3 items-center justify-start  overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-gray-500 hover:scrollbar-track-gray-200 grow  px-4 lg:px-16 py-5">
        {/* Affichage des messages */}
        <div
          className="grow overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-gray-500 hover:scrollbar-track-gray-200 w-full rounded border border-gray-800/60 dark:border-gray-300 p-5"
          ref={scrollMessagesRef}
        >
          {" "}
          {/* Loader */}
          {messagesLoading && (
            <div className="flex justify-center gap-10 items-center">
              Chargement des messages <ClipLoader />
            </div>
          )}
          {messages?.length === 0 ? (
            <p className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 right-0 text-gray-600 dark:text-gray-300">
              Vous n'avez encore échangé aucun message avec cet utilisateur{" "}
            </p>
          ) : (
            messages.map((message) =>
              message.sender === user.id ? (
                // Côté utilisateur connecté
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-start items-center gap-3">
                    <img
                      src={user.photo}
                      alt="photo de profil"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full self-start"
                    ></img>
                    <div className=" bg-blue-500 relative w-fit max-w-1/2 max-h-fit break-words whitespace-pre-wrap my-3 p-2 rounded-2xl rounded-tl-none">
                      <p className="">{message.message}</p>
                      {message.image && (
                        <>
                          <Zoom classDialog="custom-zoom">
                            <img
                              className="w-[50px] lg:w-[100px] lg:max-h-[100px] max-h-[50px] mx-auto mt-1"
                              src={message.image}
                              alt="image du message"
                            />
                          </Zoom>
                          {/* 👇 Bouton de téléchargement */}
                          <a
                            href={`http://localhost/React/project-w/backend/proxy.php?url=${encodeURIComponent(
                              message.image
                            )}`}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-full p-1 absolute -right-10
                            bottom-0"
                          >
                            <DownloadIcon className="text-gray-600  hover:text-blue-600" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Côté autre utilisateur
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-end items-center gap-3">
                    <div className=" bg-blue-500 relative w-fit max-w-1/2 max-h-1/2 my-3 p-2 break-words whitespace-pre-wrap rounded-2xl rounded-tr-none">
                      <p>{message.message}</p>
                      {message.image && (
                        <>
                          <Zoom shouldCloseonScroll={false}>
                            <img
                              className="w-[50px] lg:w-[100px] lg:max-h-[100px] max-h-[50px] mx-auto mt-1"
                              src={message.image}
                              alt="image du message"
                            />
                          </Zoom>
                          {/* 👇 Bouton de téléchargement */}
                          <a
                            href={`http://localhost/React/project-w/backend/proxy.php?url=${encodeURIComponent(
                              message.image
                            )}`}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-full p-1 absolute -left-10 bottom-0"
                          >
                            <DownloadIcon className="text-gray-600 hover:text-blue:600" />
                          </a>
                        </>
                      )}
                    </div>{" "}
                    <img
                      src={otherUser.photo}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full self-start"
                      alt="image "
                    ></img>
                  </div>
                </motion.div>
              )
            )
          )}
        </div>{" "}
        {/* Formulaire */}
        <form
          onSubmit={handleSubmit(onSubmit, (errors) =>
            toast.error(errors.message.message)
          )}
          className="w-full lg:w-2/3"
        >
          {/* Zone de saisie du message */}
          <div className=" w-full mx-auto flex gap-5">
            <div
              className="cursor-text grow"
              onClick={() => messageContentRef.current.focus()}
            >
              <div className="relative">
                {/* Saisie du texte */}
                <textarea
                  disabled={mutateLoading}
                  {...registerRest}
                  ref={combinedRef}
                  className="peer border border-b-0 focus:border-2 border-gray-800/60 dark:border-gray-300 focus:border-b-0 focus:border-blue-600 outline-none rounded-t p-3 w-full resize-none"
                  rows={1}
                  placeholder="Ecrivez votre message..."
                  onKeyDown={submitForm}
                ></textarea>
                <div className="w-full -mt-2 px-2 pt-2 border-gray-800/60 dark:border-gray-300 border border-t-0 peer-focus:border-2 rounded-b peer-focus:border-t-0 peer-focus:border-blue-600 ">
                  {" "}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        ref={emojiBtnRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEmoji((prev) => !prev);
                        }}
                        className=" hover:scale-110 transition "
                      >
                        <Smile className="text-gray-600 dark:text-gray-400 transition-colors hover:cursor-pointer" />
                      </button>{" "}
                      {/* Popup emoji */}
                      <AnimatePresence>
                        {showEmoji && (
                          <motion.div
                            ref={emojiRef}
                            className="absolute bottom-full left-0 mb-2 z-50"
                          >
                            <EmojiPicker
                              theme="dark"
                              width={"100%"}
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
                      {/* Label déclencheur pour choisir un fichier */}
                      <label htmlFor="file-upload">
                        <ImagePlus className="text-gray-600 dark:text-gray-400 cursor-pointer hover:scale-110 transition-all" />
                      </label>
                      {/* Input de type fichier (caché mais déclenché par le label) */}
                      <input
                        id="file-upload"
                        ref={fileRef}
                        name="image"
                        onChange={(e) => {
                          onFileChange(e);
                          showPreview(e);
                        }}
                        type="file"
                        className="hidden"
                      />
                    </div>
                    {/* Bouton de soumission */}
                    <div className="h-1/2 self-center">
                      <button
                        className=" rounded-full p-2 cursor-pointer"
                        type="submit"
                        disabled={mutateLoading}
                      >
                        <Send />
                      </button>
                    </div>{" "}
                  </div>
                </div>{" "}
                {/* Prévisualisation de l'image */}
                <motion.div
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 "
                >
                  <AnimatePresence>
                    {selectedFile && (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative max-w-[50px] lg:max-w-[100px] hover:scale-105 transition cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFile();
                        }}
                      >
                        {/* Croix de suppression positionnée en haut à droite de l’image */}
                        <motion.div
                          className="absolute -top-2 -right-2 rounded-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CircleX size={20} />
                        </motion.div>

                        {/* Image prévisualisée */}
                        <motion.img
                          src={preview}
                          className="max-w-full max-h-10 rounded"
                          layout
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.main>
  );
}

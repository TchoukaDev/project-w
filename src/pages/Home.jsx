import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../contexts/userContext";
import WelcomeModal from "../components/WelcomeModal";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useCreateWave } from "../hooks/waves/useCreateWave";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { CircleX, ImagePlus, Smile, X } from "lucide-react";
import Modal from "react-modal";
import { useDeleteWave } from "../hooks/waves/useDeleteWave";
import { useWaves } from "../hooks/waves/useWaves";
import { Link } from "react-router";
import Loader from "../components/Loader";
import { dateToFr, insertEmoji } from "../utilities/functions";
import { ClipLoader } from "react-spinners";
import EmojiPicker from "emoji-picker-react";
import { useClickOutside } from "../hooks/utilities/useClickOutside";
import WaveInteraction from "../components/WaveInteractions";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function Home() {
  // État pour afficher la modale de bienvenue si l'utilisateur n'a pas de pseudo
  const [showModal, setShowModal] = useState(false);

  // État pour stocker le message à supprimer
  const [wavetoDelete, setWavetoDelete] = useState(null);

  // État pour afficher ou masquer le picker d'emojis
  const [showEmoji, setShowEmoji] = useState(false);

  // État local pour la prévisualisation de l'image
  const [preview, setPreview] = useState(null);

  // Fichier sélectionné par l'utilisateur
  const [selectedFile, setSelectedFile] = useState(null);

  // Récupère l'utilisateur via le contexte
  const { user, loading: userLoading } = useContext(UserContext);

  // Récupération des waves
  const { data: waves = [], isLoading: loadingWaves } = useWaves(null);

  // Hook de mutation pour créer une wave
  const { mutate, isLoading } = useCreateWave(
    user?.uid,
    user?.pseudo,
    user?.photo
  );

  // Référence au champ de texte du message
  const waveContentRef = useRef(null);

  // Références pour le picker d'emoji
  const emojiRef = useRef();
  const emojiBtnRef = useRef();

  const fileRef = useRef(); // Référence pour l'input de chargement d'image (pour pouvoir le vider)

  // Fermer le picker emoji si clic en dehors
  useClickOutside(emojiRef, emojiBtnRef, () => {
    setShowEmoji(false);
  });

  // Formulaire avec react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Hook de suppression de wave
  const { mutate: mutateDeletePost, isLoading: isLoadingDelete } =
    useDeleteWave(null);

  // Récupère les props du champ message
  const { ref: registerRef, ...registerRest } = register("message", {
    validate: (value) =>
      value.trim() !== "" ||
      selectedFile !== null ||
      "Veuillez saisir un message ou choisir un fichier",
  });

  // Fonction qui combine la ref de react-hook-form et une ref perso
  const combinedRef = (element) => {
    waveContentRef.current = element;
    registerRef(element);
  };

  // Ferme la modale de bienvenue
  const handleCloseModal = () => {
    setShowModal(false);
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

  // Téléchargement de l'image
  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch("/backend/uploads.php", {
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
    if (isLoading) return;

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
    }
    // On modifie les données
    completeData = {
      ...data,
      image: url,
    };

    reset();
    resetFile();
    mutate(completeData, {
      onSuccess: () => toast.success("Votre Wave a été publiée"),
      onError: (error) => {
        toast.error(error.message);
        setValue("message", message);
      },
    });
  };

  // Suppression de la wave sélectionnée
  const onDeleteClick = () => {
    if (isLoadingDelete) return;
    mutateDeletePost(wavetoDelete.wid, {
      onSuccess: () => toast.success("Votre Wave a été supprimé."),
      onError: (error) => toast.error(error.message),
    });
    setWavetoDelete(null);
  };

  // Affiche la modale si l'utilisateur n'a pas encore de pseudo
  useEffect(() => {
    if (user && !user.pseudo) {
      setShowModal(true);
    }
  }, [user]);

  // Affiche un loader si les données sont encore en chargement
  if (userLoading || loadingWaves) return <Loader />;

  return (
    <>
      {/* Animation principale de la page */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="container flex flex-col lg:flex-row items-stretch"
      >
        {/* Modale de bienvenue */}
        {showModal && <WelcomeModal onCloseModal={handleCloseModal} />}

        {/* Colonne de gauche - création d'une Wave */}
        <div className="flex flex-col justify-evenly px-5 md:px-16 py-5 border-b lg:border-b-0 lg:border-r basis-1/3 shrink-0 border-gray-600 ">
          <div className="flex justify-center items-center text-gray-600 dark:text-gray-300 my-5 font-semibold !font-roboto underline text-2xl">
            Salut {user?.firstName || user?.pseudo}!{" "}
          </div>
          <div className="flex justify-center items-center text-gray-600 dark:text-gray-300 my-7 font-semibold !font-roboto text-xl">
            Souhaites-tu partager quelque chose aujourd'hui?{" "}
          </div>

          {/* Formulaire de publication */}
          <form
            onSubmit={handleSubmit(onSubmit, (errors) =>
              toast.error(errors.message.message)
            )}
          >
            <div className="flex flex-col gap-12 items-center">
              {/* Zone de saisie du message */}
              <div className=" w-full relative">
                <div
                  className="cursor-text"
                  onClick={() => waveContentRef.current.focus()}
                >
                  <textarea
                    {...registerRest}
                    ref={combinedRef}
                    className="peer border border-b-0 focus:border-2 focus:border-b-0 focus:border-blue-600 outline-none rounded-t p-3 w-full resize-none"
                    rows={5}
                    placeholder="Ecrivez votre message..."
                  ></textarea>
                  <div className="w-full -mt-2 px-2 pt-2 border border-t-0 peer-focus:border-2 peer-focus:border-t-0 rounded-b peer-focus:border-blue-600 ">
                    <div className="relative flex pb-2 gap-2">
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
                                  waveContentRef,
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
                      <label htmlFor="file-upload" className="self-center">
                        <ImagePlus className="text-gray-400 cursor-pointer hover:scale-110 transition" />
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
                      <div className="flex justify-center grow">
                        <AnimatePresence>
                          {selectedFile && (
                            <motion.div
                              key="preview"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className="relative max-w-[100px] hover:scale-105 transition cursor-pointer"
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
                                className="max-w-[100px] max-h-[50px] rounded"
                                layout
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>{" "}
                      </div>
                    </div>
                  </div>{" "}
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

        {/* Colonne de droite - affichage des messages */}
        <div className="flex flex-col items-center py-5 px-5 mt-10 md:px-16 gap-10 grow">
          <h1 className="text-center w-full">Fil d'actualités:</h1>
          <div className="flex flex-col w-full">
            {loadingWaves ? (
              <p className="flex flex-col justify-center text-xl items-center grow">
                Chargement en cours...
                <ClipLoader color="blue" />
              </p>
            ) : waves?.length === 0 ? (
              <p className="flex flex-col justify-center text-xl items-center grow">
                Aucune actualité pour le moment.
              </p>
            ) : (
              [...waves]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((wave) => (
                  <div key={wave.wid} className="flex flex-col mb-6 relative">
                    {/* En-tête du message */}
                    <div className="flex flex-col gap-5 border border-gray-300 transition-all dark:border-gray-300/20 rounded-t py-3 px-6">
                      <div className="flex gap-5 items-center">
                        <div className="flex justify-between items-center grow">
                          <Link
                            to={
                              wave.pseudo === user.pseudo
                                ? "/profile"
                                : `/profile/${wave.pseudo}`
                            }
                          >
                            <div className="flex items-center gap-3 underline text-xl text-blue-600 !font-pompiere">
                              <img
                                src={wave.photo}
                                className="w-[30px]  h-[30px] rounded-full"
                              />{" "}
                              {wave.pseudo}
                            </div>
                          </Link>
                          <div className="text-white/50 !font-pompiere">
                            {dateToFr(wave.createdAt)}
                          </div>
                        </div>
                        {wave.uid === user.uid && (
                          <div className="flex items-start">
                            <X
                              onClick={() => setWavetoDelete(wave)}
                              className="hover:cursor-pointer hover:text-blue-600"
                              size={16}
                              strokeWidth={2.75}
                            />
                          </div>
                        )}
                      </div>
                      <p>{wave.message}</p>
                      {wave.image && (
                        <Zoom classDialog="custom-zoom">
                          <div>
                            <img
                              className="mx-auto max-h-[150px] max-w-[100%]"
                              src={wave.image}
                              alt="image publiée"
                            />
                          </div>
                        </Zoom>
                      )}
                    </div>

                    {/* Zone d'interaction : like, répondre, voir réponses */}
                    <WaveInteraction user={user} wave={wave} />
                  </div>
                ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Modale de confirmation de suppression */}
      {wavetoDelete && (
        <Modal
          isOpen={true}
          className="bg-gray-600 border shadow-custom p-6 text-gray-200 dark:text-white rounded w-1/3 h-1/3 mx-auto mt-40"
          overlayClassName="fixed inset-0 z-10 bg-black/60 flex justify-center items-center"
          onRequestClose={() => setWavetoDelete(null)}
        >
          <div className="flex flex-col justify-evenly h-full items-center-safe">
            <p className="font-semibold">
              Voulez-vous vraiment supprimer ce post?{" "}
            </p>
            <div className="flex gap-10 items-center">
              <Button onClick={onDeleteClick} type="button">
                {isLoadingDelete ? (
                  <div>
                    Suppression en cours...
                    <ClipLoader size={10} color="white" />
                  </div>
                ) : (
                  "Valider"
                )}
              </Button>
              <Button onClick={() => setWavetoDelete(null)} type="button">
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

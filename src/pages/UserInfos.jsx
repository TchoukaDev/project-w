import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/userContext";
import { useUpdateUser } from "../hooks/users/useUpdateUser";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

export default function UserInfos() {
  // État qui permet de rediriger après la mise à jour des infos
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Récupération des infos de l'utilisateur via le contexte
  const { user } = useContext(UserContext);

  // État local pour la prévisualisation de la photo de profil
  const [preview, setPreview] = useState(user.photo);

  // Fichier sélectionné par l'utilisateur pour remplacer la photo actuelle
  const [selectedFile, setSelectedFile] = useState(null);

  // Hook custom pour mettre à jour les infos utilisateur dans la base
  const { mutate, isLoading } = useUpdateUser(user.uid);

  // Hook de navigation
  const navigate = useNavigate();

  // Initialisation de react-hook-form avec les valeurs actuelles de l'utilisateur
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pseudo: user?.pseudo || "",
      firstName: user?.firstName || "",
      name: user?.name || "",
      email: user?.email || "",
      birthday: user?.birthday || "",
      city: user?.city || "",
      country: user?.country || "",
    },
  });

  // Met à jour le fichier sélectionné dans l'état
  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Récupérer la base url selon l'environnement
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8000/backend"
      : "https://waves.romainwirth.fr/backend");

  // Envoie la photo sur le serveur PHP via fetch et retourne son URL
  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("oldPhotoPath", user.photo);

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

  // Affiche un aperçu temporaire de la photo sélectionnée (avant upload)
  const showPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Gestion de la soumission du formulaire
  const onSubmit = async (data) => {
    let photoUrl = user.photo;

    // Si un nouveau fichier est sélectionné, on l'envoie sur le serveur
    if (selectedFile) {
      photoUrl = await uploadPhoto();
    }

    // Préparation des données à envoyer
    const updatedData = { photo: photoUrl, ...data };

    // Envoie les données via le hook mutate
    mutate(updatedData, {
      onSuccess: () => {
        toast.success("Vos informations ont été modifiées avec succès");
        setShouldNavigate(true); // active la redirection via useEffect
      },
      onError: () => {
        toast.error(
          "Une erreur est survenue lors de la modification de vos informations"
        );
      },
    });
  };

  // Redirection manuelle après succès (évite les bugs en redirigeant dans onSuccess directement)
  useEffect(() => {
    if (shouldNavigate) {
      navigate("/settings");
    }
  }, [shouldNavigate, navigate]);

  return (
    <motion.main
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8 text-center md:text-start">
        Saisissez vos informations personnelles:
      </div>

      {/* Formulaire principal */}
      <form
        className="flex flex-col-reverse md:flex-row justify-between"
        onSubmit={handleSubmit(onSubmit, (error) =>
          toast.error(error.pseudo.message)
        )}
      >
        {/* Colonne de gauche avec les champs texte */}
        <div className=" ml-5 flex flex-col justify-between gap-5 items-center md:items-start">
          {/* Pseudo */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="pseudo">
              Pseudo:
            </label>
            <input
              className="inputSettings"
              id="pseudo"
              {...register("pseudo", {
                validate: (value) =>
                  value.trim().length > 0 ||
                  "Le pseudo doit absolument être renseigné",
                maxLength: {
                  value: 15,
                  message: "Votre pseudo ne peut excéder 15 caractères",
                },
              })}
            />
          </p>

          {/* First Name */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="firstName">
              Prénom:
            </label>
            <input
              className="inputSettings"
              id="firstName"
              {...register("firstName")}
            />
          </p>

          {/* Name */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="name">
              Nom:
            </label>
            <input className="inputSettings" id="name" {...register("name")} />
          </p>

          {/* Email */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="name">
              Email
            </label>
            <input
              className="inputSettings opacity-50 cursor-not-allowed"
              id="email"
              {...register("email")}
              disabled
            />
          </p>

          {/* Birthday */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="birthday">
              Date de naissance:
            </label>
            <input
              className="inputSettings cursor-text"
              id="birthday"
              type="date"
              {...register("birthday")}
            />
          </p>

          {/* City */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="city">
              Ville:
            </label>
            <input className="inputSettings" id="city" {...register("city")} />
          </p>

          {/* Country */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="country">
              Pays:
            </label>
            <input
              className="inputSettings"
              id="country"
              {...register("country")}
            />
          </p>

          {/* Boutons de validation et retour */}
          <div className="flex gap-3 mt-6 md:gap-6 flex-col md:flex-row items-center">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div>
                  Envoie...
                  <ClipLoader size={10} color="white" />
                </div>
              ) : (
                "Valider"
              )}
            </Button>
            <Link
              className="rounded-3xl w-[130px] text-center px-4 py-2 border border-transparent text-white bg-blue-700 dark:bg-blue-800 hover:bg-blue-700/70  hover:border-black dark:hover:border-white font-semibold text-sm cursor-pointer transition-color duration-300"
              to="/settings"
            >
              Retour
            </Link>
          </div>
        </div>

        {/* Colonne droite : Photo de profil */}
        <div className="flex flex-col gap-5 items-center">
          {/* Affiche la photo actuelle ou sa prévisualisation */}
          <img className="w-[150px] h-[150px] rounded" src={preview} />

          {/* Label déclencheur pour choisir un fichier */}
          <label
            htmlFor="file-upload"
            className="hover:cursor-pointer hover:text-blue-600 hover:underline border border-gray-600 rounded mt-5 mb-10 p-2"
          >
            Modifier la photo de profil
          </label>

          {/* Input de type fichier (caché mais déclenché par le label) */}
          <input
            id="file-upload"
            name="photo"
            onChange={(e) => {
              onFileChange(e);
              showPreview(e);
            }}
            type="file"
            className="hidden"
          />
        </div>
      </form>
    </motion.main>
  );
}

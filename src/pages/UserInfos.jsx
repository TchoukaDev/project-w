import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/userContext";
import useUpdateUser from "../hooks/useUpdateUser";
import { toast } from "react-toastify";
import { animate, AnimatePresence, motion } from "framer-motion";

export default function UserInfos() {
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const { user } = useContext(UserContext);
  const [preview, setPreview] = useState(user.photo); //Prévisulation d'image
  const [selectedFile, setSelectedFile] = useState(null);
  const { mutate, isLoading } = useUpdateUser(user.uid);
  const navigate = useNavigate();
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
  console.log(user.birthday);
  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Envoie de la photo vers PHP pour téléchargement sur serveur
  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("oldPhotoPath", user.photo);

    const response = await fetch(
      "http://localhost/React/project-w/backend/uploads.php",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement de la photo");
    }
    const data = await response.json();
    return data.photoUrl;
  };

  // URL temporaire poru prévisualiser l'image
  const showPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    let photoUrl = user.photo;

    if (selectedFile) {
      photoUrl = await uploadPhoto();
    }
    const updatedData = { photo: photoUrl, ...data };
    mutate(updatedData, {
      onSuccess: () => {
        toast.success("Vos informations ont été modifiées avec succès");
        setShouldNavigate(true);
      },
      onError: () => {
        toast.error(
          "Une erreur est survenue lors de la modification de vos informations"
        );
      },
    });
  };

  // Evite de faire un navigate directement dans onSuccess, car cela ne fonctionne pas correctement
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
      <div className="mb-8">Saisissez vos informations personnelles:</div>

      <form className="flex justify-between" onSubmit={handleSubmit(onSubmit)}>
        <div className=" ml-5 flex flex-col justify-between gap-5 items-start">
          {/* Pseudo */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="pseudo">
              Pseudo:
            </label>
            <input
              className="inputSettings"
              id="pseudo"
              {...register("pseudo", {
                required: true,
                validate: (value) =>
                  value.trim().length > 0 ||
                  "Ce champ ne peut pas contenir de caractère vide",
              })}
            />
            {errors.pseudo && (
              <p className="text-red-600 my-1">
                Ce champ ne peut pas être vide.
              </p>
            )}
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

          <div className="flex gap-6 items-center">
            <Button
              type="submit"
              disabled={isLoading}
              value={isLoading ? "Envoie..." : "Valider"}
            />{" "}
            <Link
              className="bg-gray-500/30 rounded-3xl px-4 py-2 font-semibold text-sm  hover:bg-blue-500/30 cursor-pointer transition-color duration-300"
              to="/settings"
            >
              Retour
            </Link>
          </div>
        </div>

        {/* Photo de profil */}
        <div className="flex flex-col gap-5 items-center">
          <img className="w-[150px] h-[150px] rounded" src={preview} />

          <label
            htmlFor="file-upload"
            className="hover:cursor-pointer hover:text-blue-600 hover:underline border border-gray-600 rounded p-2"
          >
            Modifier la photo de profil
          </label>
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

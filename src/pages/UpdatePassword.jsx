import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserContext } from "../contexts/userContext";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

export default function UpdatePassword() {
  const { user, changeUserCredential } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { email: user.email } });

  const navigate = useNavigate();

  const onError = (errors) => {
    if (errors.oldPassword) {
      toast.error(errors.oldPassword.message);
      reset();
    }
    if (errors.newPassword) {
      toast.error(errors.newPassword.message);
      const currentValues = getValues(); // méthode de react-hook-form pour récupérer toutes les valeurs
      reset({ ...currentValues, newPassword: "", newPassword2: "" });
    }
  };
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.newPassword !== data.newPassword2) {
        throw new Error(
          "Les deux mots de passe saisis ne sont pas identiques."
        );
      }
      await changeUserCredential(data.oldPassword, data.newPassword || null);
      navigate("/settings");
    } catch (error) {
      toast.error(error.message);
      reset();
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className=" ml-5 flex flex-col justify-between gap-5 items-start">
          {/* Ancien mot de passe */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="oldPassword">
              Mot de passe actuel:
            </label>
            <input
              type="password"
              className="inputSettings"
              id="oldPassword"
              {...register("oldPassword", {
                required:
                  "Veuillez saisir votre mot de passe actuel pour modifier vos données",
              })}
            />
            {}
          </p>
          {/* Nouveau mot de passe */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="newPassword">
              Nouveau mot de passe:
            </label>
            <input
              type="password"
              className="inputSettings"
              id="newPassword"
              {...register("newPassword", {
                required: "Le mot de passe est requis",
                pattern: {
                  value:
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_])[A-Za-z\d!@#$%^&*_]{8,}$/,
                  message:
                    "8 caractères minimum, avec au moins une majuscule, un chiffre et un caractère spécial (ex: ! @ # _)",
                },
              })}
            />
          </p>
          {/* Vérification du mot de passe */}
          <p className="flex flex-col">
            <label className="text-gray-500 mr-3" htmlFor="newPassword2">
              Confirmer nouveau mot de passe:
            </label>
            <input
              type="password"
              className="inputSettings"
              id="newPassword2"
              {...register("newPassword2")}
            />
          </p>
          <div className="flex gap-6 items-center">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div>
                  Validation en cours...
                  <ClipLoader size={10} color="white" />
                </div>
              ) : (
                "Valider"
              )}
            </Button>
            <Link
              className="bg-gray-500/30 rounded-3xl px-4 py-2 font-semibold text-sm  hover:bg-blue-500/30 cursor-pointer transition-color duration-300"
              to="/settings"
            >
              Retour
            </Link>
          </div>
        </div>
      </form>
    </motion.main>
  );
}

import { useForm } from "react-hook-form";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utilities/firebase";
import { toast } from "react-toastify";
import Button from "../components/Button"; //
import { Link, useNavigate } from "react-router";
import Logo from "../components/Logo";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // Gère les erreurs + l'état "en cours"
  } = useForm();

  // Fonction appelée à la soumission du formulaire
  const onSubmit = async ({ email }) => {
    try {
      // Envoie de l’email de réinitialisation
      await sendPasswordResetEmail(auth, email);
      toast.success("Email de réinitialisation envoyé !");
      navigate("/");
    } catch (error) {
      toast.error("Erreur : " + error.message);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-8 items-center h-screen">
      <Logo size="md" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 w-[500px] p-6 rounded shadow-custom"
      >
        <h2 className="text-lg text-center">
          Vous avez oublié votre mot de passe? Saisissez votre adresse mail pour
          le réinitialiser.
        </h2>

        {/* Champ email lié avec React Hook Form */}
        <input
          type="email"
          placeholder="Votre adresse email"
          className="inputSettings mx-auto"
          {...register("email", {
            required: "L'email est obligatoire",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Format d'email invalide",
            },
          })}
        />

        {/* Affichage d'une erreur si l'email est incorrect */}
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
        <div className=" mx-auto">
          {/* Bouton désactivé pendant la soumission */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Réinitialiser"}
          </Button>
        </div>
        <Link className="text-sm text-blue-600 underline mx-auto" to="/">
          Revenir à la page de connexion
        </Link>
      </form>
    </div>
  );
}

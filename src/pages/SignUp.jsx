import { useContext, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useNavigate, Link } from "react-router";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import Logo from "../components/Logo";
import { ClipLoader } from "react-spinners";
import GoogleBtn from "../components/GoogleBtn";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Accès à la fonction d'inscription via le contexte utilisateur
  const { createUser } = useContext(UserContext);

  // Suivi des valeurs de champs pour le label animé
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");
  const password2Value = watch("password2", "");

  const [loading, setLoading] = useState(false); // État de chargement pendant la soumission
  const navigate = useNavigate(); // Redirection après inscription
  const emailRef = useRef(); // Référence pour focus automatique

  // Focus automatique sur le champ email à l'affichage du formulaire
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Configuration du champ email avec validation
  const emailRegister = register("email", {
    required: true,
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, // Regex pour vérifier le format email
      message: "Veuillez saisir une adresse email valide.",
    },
  });

  // Fonction appelée lors de la soumission du formulaire
  const onSubmit = async (data) => {
    if (loading) return; // Empêche la double soumission

    setLoading(true); // Active l’état de chargement

    try {
      await createUser(data.email, data.password); // Appel à Firebase ou autre service d'inscription
      toast.success("Inscription réussie !");
      navigate("/"); // Redirection vers la page d'accueil
    } catch (error) {
      // Gestion des erreurs Firebase
      if (error.code === "auth/email-already-in-use") {
        toast.error("Cette adresse email existe déjà");
      } else {
        toast.error(`Erreur lors de l'inscription : ${error.message}`);
      }
    } finally {
      setLoading(false); // Désactive l’état de chargement
    }
  };

  return (
    <div className="flex grow justify-evenly items-center">
      {/* Logo */}
      <Logo size="lg" />
      <main className="flex flex-col justify-center items-center ">
        <div className="flex flex-col items-center justify-between  w-[500px] shadow-lg/10 shadow-white p-9 rounded">
          <p className="text-center underline text-2xl font-semibold mb-6">
            Inscription
          </p>
          <p className="text-xl mb-6">
            Inscrivez vous dès maintenant pour pouvoir profiter de l'expérience
            Waves!
          </p>

          {/* Formulaire d'inscription */}
          <form
            className="flex flex-col items-center gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Champ email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder=""
                {...emailRegister}
                ref={(e) => {
                  emailRegister.ref(e); // Enregistrement pour RHF
                  emailRef.current = e; // Stocke la référence pour le focus
                }}
                className="input peer"
              />
              <label
                htmlFor="email"
                className={`absolute left-2 transition-all cursor-text
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 ${
        emailValue && "top-1 text-sm text-gray-400"
      }`}
              >
                Adresse e-mail
              </label>
            </div>
            {/* Affiche un message d'erreur si l'email est invalide */}
            {errors.email && (
              <p className="text-red-400"> {errors.email.message}</p>
            )}

            {/* Champ mot de passe */}
            <div className="relative">
              <input
                type="password"
                id="password"
                className="input peer"
                placeholder=""
                {...register("password", {
                  required: true,
                  minLength: {
                    value: 8,
                    message:
                      "Votre mot de passe doit contenir au moins 8 caractères",
                  },
                })}
              />
              <label
                htmlFor="password"
                className={`absolute left-2 transition-all cursor-text
              peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
              peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 ${
                passwordValue && "top-1 text-sm text-gray-400"
              }`}
              >
                Saisir un mot de passe
              </label>
            </div>

            {/* Champ confirmation mot de passe */}
            <div className="relative">
              <input
                type="password"
                id="password2"
                className="input peer"
                placeholder=""
                {...register("password2", {
                  required: true,
                  validate: (value) =>
                    value === passwordValue ||
                    "Les deux mots de passe doivent être identiques",
                })}
              />
              <label
                htmlFor="password2"
                className={`absolute left-2 transition-all cursor-text
              peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
              peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500 ${
                password2Value && "top-1 text-sm text-gray-400"
              }`}
              >
                Confirmer le mot de passe
              </label>
            </div>

            {/* Affichage des erreurs des champs password et password2 */}
            <div>
              {errors.password && (
                <p className="text-red-400">{errors.password.message}</p>
              )}
              {errors.password2 && (
                <p className="text-red-400">{errors.password2.message}</p>
              )}
            </div>

            {/* Bouton d'inscription et bouton Google */}
            <div className="flex flex-col gap-4 mb-5">
              <Button margin="mt-3 mb-2" type="submit" disabled={loading}>
                {loading ? (
                  <div>
                    Inscription en cours...
                    <ClipLoader size={10} color="white" />
                  </div>
                ) : (
                  "S'inscrire"
                )}
              </Button>
              <hr className="text-gray-500" />
              <p className="bg-black mx-auto text-center w-1/6 mt-[-28px] z-10">
                ou
              </p>
              <GoogleBtn>S'inscrire avec Google</GoogleBtn>
            </div>
          </form>

          {/* Lien vers la page de connexion */}
          <div>
            Vous avez déjà un compte?{" "}
            <Link className="underline text-blue-500" to="/">
              Connectez-vous
            </Link>{" "}
          </div>
        </div>
      </main>
    </div>
  );
}

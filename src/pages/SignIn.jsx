import { useContext, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { ClipLoader } from "react-spinners";
import GoogleBtn from "../components/GoogleBtn";
import { useMediaQuery } from "react-responsive";

export default function SignIn() {
  const {
    register,
    handleSubmit,
    watch, // Fonction pour observer les valeurs des champs
    formState: { errors },
  } = useForm();

  // Hook personnalisé pour gérer le responsive
  const isLg = useMediaQuery({
    minWidth: 1024,
  });
  const isSm = useMediaQuery({ maxWidth: 639 });

  // Récupération des fonctions de login et loading depuis le contexte utilisateur
  const { loginUser, loading, setLoading } = useContext(UserContext);

  // On observe les valeurs en temps réel pour animer les labels
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  const navigate = useNavigate(); // Pour rediriger l’utilisateur
  const emailRef = useRef(); // Pour focus automatiquement le champ email

  // Focus automatique sur le champ email à l’ouverture de la page
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Définition du champ email avec validation de format
  const emailRegister = register("email", {
    required: "Veuillez saisir votre adresse email",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, // Regex email
      message: "Veuillez saisir une adresse email valide.",
    },
  });

  // Fonction appelée à la soumission du formulaire
  const onSubmit = (data) => {
    if (loading) return; // Empêche la double soumission si déjà en cours

    setLoading(true); // Active le chargement

    loginUser(data.email, data.password)
      .then((userCredential) => {
        toast.success("Connexion réussie!");
        navigate("/"); // Redirection vers la page d'accueil
      })
      .catch((error) => {
        const { code } = error;
        if (code === "auth/invalid-credential") {
          toast.error("La combinaison email/mot de passe est incorrecte");
        } else {
          toast.error(code); // Affiche un code d’erreur générique sinon
        }
      })
      .finally(() => setLoading(false)); // Arrête le chargement
  };

  return (
    <main className="flex flex-col lg:flex-row grow justify-evenly items-center">
      {/* Logo */}
      <Logo size={isSm ? "sm" : isLg ? "lg" : "md"} />

      <div className="flex flex-col items-center justify-between  w-[95%] sm:w-[500px] shadow-custom-black dark:shadow-custom p-9 rounded">
        <h1 className="text-center underline text-2xl font-semibold mb-6">
          Connexion
        </h1>
        <p className="text-lg text-center mb-6">
          Bienvenue sur Waves. Pour commencez, connectez-vous:{" "}
        </p>

        {/* Formulaire de connexion */}
        <form
          className="flex flex-col items-center gap-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Champ email */}
          <div className="relative">
            <input
              autoComplete="email"
              type="email"
              id="email"
              className="input peer"
              placeholder=" "
              {...emailRegister}
              ref={(e) => {
                emailRegister.ref(e); // Référence pour react-hook-form
                emailRef.current = e; // Référence pour le focus auto
              }}
            />
            <label
              htmlFor="email"
              className={`absolute left-2  transition-all bg-transparent cursor-text
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500  ${
        emailValue && "top-1 text-sm text-gray-400 "
      }`}
            >
              Adresse email
            </label>
          </div>
          {/* Message d'erreur si le champ email est invalide */}
          {errors.email && (
            <p className="text-red-400">{errors.email.message}</p>
          )}

          {/* Champ mot de passe */}
          <div className="relative">
            <input
              type="password"
              id="password"
              className="input peer"
              placeholder=""
              {...register("password", {
                required: "Veuillez saisir votre mot de passe",
              })}
            />
            <label
              htmlFor="password"
              className={`absolute left-2  transition-all cursor-text
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500  ${
                  passwordValue && "top-1 text-sm text-gray-400 "
                }`}
            >
              Mot de passe
            </label>
          </div>
          {/* Message d'erreur si le champ password est invalide */}
          {errors.password && (
            <p className="text-red-400">{errors.password.message}</p>
          )}

          {/* Boutons */}
          <div className="flex flex-col gap-3">
            <Button type="submit">
              {/* Affiche un loader si loading en cours */}
              {loading ? (
                <div>
                  Connexion...
                  <ClipLoader size={10} color="white" />
                </div>
              ) : (
                "Se connecter"
              )}
            </Button>
            {/* Bouton Google personnalisé */}
            <GoogleBtn>Se connecter avec Google</GoogleBtn>
          </div>
        </form>

        {/* Lien vers la page de mot de passe oublié */}
        <Link className=" link mt-2 mb-9 text-sm" to="/forgotPassword">
          Mot de passe oublié?
        </Link>

        {/* Lien vers l’inscription */}
        <div>
          Pas encore de compte?{" "}
          <Link className=" link" to="/signUp">
            Inscrivez vous
          </Link>
        </div>
      </div>
    </main>
  );
}

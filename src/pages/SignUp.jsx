import { useContext, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useNavigate, Link } from "react-router";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import Logo from "../components/Logo";
import { ClipLoader } from "react-spinners";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { createUser } = useContext(UserContext);
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const emailRegister = register("email", {
    required: true,
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      message: "Veuillez saisir une adresse email valide.",
    },
  });

  const onSubmit = async (data) => {
    if (loading) {
      return;
    }
    setLoading(true);

    try {
      await createUser(data.email, data.password);
      toast.success("Inscription réussie !");
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Cette adresse email existe déjà");
      } else {
        toast.error(`Erreur lors de l'inscription : ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex grow justify-evenly items-center">
      <Logo size="lg" />
      <main className="flex flex-col justify-center items-center ">
        <div className="flex flex-col items-center justify-between  w-[500px] h-[500px] shadow-lg/10 shadow-white p-9 rounded">
          <p className="text-center underline text-2xl font-semibold mb-6">
            Inscription
          </p>
          <p className="text-xl">
            Inscrivez vous dès maintenant pour pouvoir profiter de l'expérience
            Waves!
          </p>
          <form
            className="flex flex-col items-center gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder=""
                {...emailRegister}
                ref={(e) => {
                  emailRegister.ref(e);
                  emailRef.current = e;
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
                // peer-placeholder-shown : quand le placeholder (vide et recouvert par label) est actif, ce style s'applique
                // peer-focus: le style s'applique lors du focus de l'input
              >
                Adresse e-mail
              </label>
            </div>
            {errors.email && (
              <p className="text-red-400"> {errors.email.message}</p>
            )}
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
              ></input>
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
            {errors.password && (
              <p className="text-red-400">{errors.password.message}</p>
            )}
            <Button margin="my-6" type="submit" disabled={loading}>
              {" "}
              {loading ? (
                <div>
                  Inscription en cours...
                  <ClipLoader size={10} color="white" />
                </div>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>
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

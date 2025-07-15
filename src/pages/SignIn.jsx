import { useContext, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../contexts/userContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { ClipLoader } from "react-spinners";

export default function SignIn() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { loginUser, loading, setLoading } = useContext(UserContext);
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

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
  const onSubmit = (data) => {
    if (loading) {
      return;
    }
    setLoading(true);
    loginUser(data.email, data.password)
      .then((userCredential) => {
        toast.success("Connexion réussie!");
        navigate("/");
      })
      .catch((error) => {
        const { code } = error;
        if (code === "auth/invalid-credential") {
          toast.error("La combinaison email/mot de passe est incorrecte");
        } else {
          toast.error(code);
        }
      })
      .finally(() => setLoading(false));
  };
  return (
    <div className="flex grow justify-evenly items-center">
      <Logo size="lg" />
      <main className="flex flex-col justify-center items-center ">
        <div className="flex flex-col items-center justify-between  w-[500px] h-[500px] shadow-lg/10 shadow-white p-9 rounded">
          <p className="text-center underline text-2xl font-semibold mb-6">
            Connexion
          </p>
          <p className="text-xl">
            Bienvenue sur Waves. Pour commencez, connectez-vous:{" "}
          </p>

          {/* Formulaire */}
          <form
            className="flex flex-col items-center gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="relative">
              <input
                autoComplete="email"
                type="email"
                id="email"
                className="input peer"
                placeholder=" "
                {...emailRegister}
                ref={(e) => {
                  emailRegister.ref(e); // <- donne le ref à React Hook Form
                  emailRef.current = e; // <- garde le ref dans ton useRef
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
            {errors.email && (
              <p className="text-red-400">{errors.email.message}</p>
            )}
            <div className="relative">
              <input
                type="password"
                id="password"
                className="input peer"
                placeholder=""
                {...register("password", {
                  required: true,
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
            <Button margin="my-6" type="submit">
              {" "}
              {loading ? (
                <div>
                  Connexion...
                  <ClipLoader size={10} color="white" />
                </div>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
          <div>
            Pas encore de compte?{" "}
            <Link className=" underline text-blue-500" to="/signUp">
              Inscrivez vous
            </Link>{" "}
          </div>
        </div>
      </main>
    </div>
  );
}

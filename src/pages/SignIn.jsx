import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../contexts/authContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";

export default function SignIn() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { loginUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");
  const navigate = useNavigate();

  const onSubmit = (data) => {
    if (loading) {
      return;
    }
    setLoading(true);
    loginUser(data.email, data.password)
      .then((userCredential) => {
        setLoading(false);
        toast.success("Connexion réussie!");
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        const { code } = error;
        if (code === "auth/invalid-credential") {
          toast.error("La combinaison email/mot de passe est incorrecte");
        } else {
          toast.error(code);
        }
      });
  };
  return (
    <main className="flex flex-col justify-center items-center grow ">
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
              type="email"
              id="email"
              className="input peer"
              placeholder=" "
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Veuillez saisir une adresse email valide.",
                },
              })}
            />
            <label
              htmlFor="email"
              className={`absolute left-2  transition-all cursor-text
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
              className="input peer"
              placeholder=""
              {...register("password", {
                required: true,
              })}
            />
            <label
              htmlFor="password"
              className={`absolute left-2  transition-all cursos-text
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500  ${
                  passwordValue && "top-1 text-sm text-gray-400 "
                }`}
            >
              Mot de passe
            </label>
          </div>
          <Button
            margin="my-6"
            type="submit"
            value={loading ? "Connexion..." : "Se connecter"}
          />
        </form>
        <div>
          Pas encore de compte?{" "}
          <Link className="font-semibold underline" to="/signUp">
            Inscrivez vous
          </Link>{" "}
        </div>
      </div>
    </main>
  );
}

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { useNavigate } from "react-router";
import { AuthContext } from "../contexts/authContext";
import { toast } from "react-toastify";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { createUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    if (loading) {
      return;
    }
    setLoading(true);

    createUser(data.email, data.password)
      .then((userCredential) => {
        setLoading(false);
        toast.success("Inscription réussie!");
        navigate("/");
      })
      .catch((error) => {
        const { code } = error;
        if (error.code === "auth/email-already-in-use") {
          toast.error("Cet adresse email existe déjà");
        } else toast.error(code);
      });
  };

  return (
    <main className="flex flex-col justify-center items-center grow ">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <input
            type="email"
            id="email"
            placeholder=""
            {...register("email", {
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Renseignez une adresse valide",
              },
            })}
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
            // le style s'applique lors du focus de l'input
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
        <Button
          margin="my-6"
          type="submit"
          value={loading ? "Inscription en cours..." : "S'inscrire"}
        />
      </form>
    </main>
  );
}

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../contexts/authContext";
import { toast } from "react-toastify";
import { Link } from "react-router";

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { loginUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data) => {
    if (loading) {
      return;
    }
    setLoading(true);
    loginUser(data.email, data.password)
      .then((userCredential) => {
        setLoading(false);
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
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Adresse email"
          {...register("email", {
            required: true,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: "Veuillez saisir une adresse email valide.",
            },
          })}
        />
        {errors.email && <p className="text-red-400">{errors.email.message}</p>}
        <input
          type="password"
          placeholder="Mot de passe"
          {...register("password", {
            required: true,
          })}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <div>
        Pas encore de compte? <Link to="/signUp">Inscrivez vous</Link>{" "}
      </div>
    </div>
  );
}

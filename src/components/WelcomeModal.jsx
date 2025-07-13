import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { UserContext } from "../contexts/userContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useUpdateUser } from "../hooks/users/useUpdateUser";

export default function WelcomeModal({ onCloseModal }) {
  const [isBrowser, setIsBrowser] = useState(false);
  const { user } = useContext(UserContext);
  const pseudoRef = useRef();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate, isLoading } = useUpdateUser(user.uid);

  const pseudoRegister = register("pseudo", {
    required: "Le pseudo est obligatoire",
    validate: (value) =>
      value.trim() !== "" ||
      "Le pseudo ne peut pas être vide ou composé d'espaces",
  });

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Votre pseudo a été mis à jour.");
        onCloseModal();
      },
      onError: () => {
        toast.error(
          "Une erreur est survenue lors de la mise à jour de votre pseudo"
        );
      },
    });
  };

  // S'assurer que le DOM soit prêt pour afficher la modale
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      pseudoRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const modalContent = (
    <div className=" bg-black/70 fixed inset-0 flex justify-center items-center z-50 text-black">
      <div className="bg-gray-950 border shadow shadow-custom text-xl p-8 rounded-lg  w-2/3 lg:w-1/2  relative">
        <p className="text-white my-7 text-center">
          Bienvenue sur Waves. Avant de faire vos premiers pas, veuillez choisir
          un pseudo. Ne vous inquiétez pas, vous pourrez le modifier par la
          suite.
        </p>
        <form
          className="w-1/3 mx-auto text-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className="w-full border border-gray-400 rounded-md p-2 placeholder:text-sm outline-none focus:border-2 focus:border-blue-500 my-7 text-white text-sm"
            type="text"
            name="pseudo"
            placeholder="Saisissez votre pseudo..."
            {...pseudoRegister}
            ref={(e) => {
              pseudoRegister.ref(e);
              pseudoRef.current = e;
            }}
          />
          {errors.pseudo && (
            <p className="text-red-600 font-semibold">
              {errors.pseudo.message}
            </p>
          )}
          <Button
            margin="my-5"
            type="submit"
            disabled={isLoading}
            value="Valider"
          ></Button>
        </form>
      </div>
    </div>
  );

  return isBrowser ? createPortal(modalContent, document.body) : null;
}

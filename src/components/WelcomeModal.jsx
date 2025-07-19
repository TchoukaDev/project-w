import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { UserContext } from "../contexts/userContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useUpdateUser } from "../hooks/users/useUpdateUser";

export default function WelcomeModal({ onCloseModal }) {
  // État local pour vérifier si le rendu est effectué côté client (navigateur)
  const [isBrowser, setIsBrowser] = useState(false);

  // Récupération de l'utilisateur via le contexte
  const { user } = useContext(UserContext);

  // Référence vers le champ input pour le focus automatique
  const pseudoRef = useRef();

  // Initialisation du formulaire avec react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Hook personnalisé pour mettre à jour les données utilisateur sur Firebase
  const { mutate, isLoading } = useUpdateUser(user.uid);

  // Enregistrement du champ "pseudo" avec règles de validation
  const pseudoRegister = register("pseudo", {
    required: "Le pseudo est obligatoire",
    validate: (value) =>
      value.trim() !== "" ||
      "Le pseudo ne peut pas être vide ou composé d'espaces",
  });

  // Fonction appelée lors de la soumission du formulaire
  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Votre pseudo a été mis à jour.");
        onCloseModal(); // Fermeture de la modale
      },
      onError: () => {
        toast.error(
          "Une erreur est survenue lors de la mise à jour de votre pseudo"
        );
      },
    });
  };

  // Utilisé pour activer le rendu côté client (utile avec createPortal)
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Ajout d'un léger délai pour forcer le focus sur l'input après affichage
  useEffect(() => {
    const timer = setTimeout(() => {
      pseudoRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Contenu JSX de la modale
  const modalContent = (
    <div className=" bg-black/70 fixed inset-0 flex justify-center items-center z-50 text-black">
      <div className="bg-gray-950 border shadow shadow-custom text-xl p-8 rounded-lg  w-2/3 lg:w-1/2  relative">
        <p className="text-white my-7 text-center">
          Bienvenue sur Waves. Avant de faire vos premiers pas, veuillez choisir
          un pseudo. Ne vous inquiétez pas, vous pourrez le modifier par la
          suite.
        </p>

        {/* Formulaire pour saisir le pseudo */}
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
              // On combine la ref de react-hook-form et notre ref personnalisée
              pseudoRegister.ref(e);
              pseudoRef.current = e;
            }}
          />

          {/* Affichage d'un message d'erreur si la validation échoue */}
          {errors.pseudo && (
            <p className="text-red-600 font-semibold">
              {errors.pseudo.message}
            </p>
          )}

          {/* Bouton de validation du formulaire */}
          <Button margin="my-5" type="submit" disabled={isLoading}>
            Valider
          </Button>
        </form>
      </div>
    </div>
  );

  // Affiche le contenu de la modale dans le body si on est bien côté navigateur
  return isBrowser ? createPortal(modalContent, document.body) : null;
}

import { Link } from "react-router";
import Layout from "../components/layout/Layout";

export default function Error() {
  return (
    <div className="flex flex-col justify-center items-center mt-26">
      <p className="text-8xl italic font-bold font-pompiere opacity-30">
        OUPS!
      </p>
      <p className="my-24 text-xl font-semibold">
        Il semblerait qu'il y ait une erreur... La page que vous avez demandée
        n'existe pas.
      </p>
      <Link
        to="/"
        className="bg-gray-300/30 rounded-3xl p-3 font-semibold hover:bg-gray-300 hover:text-black transition-color duration-300"
      >
        Retourner à l'accueil
      </Link>
    </div>
  );
}

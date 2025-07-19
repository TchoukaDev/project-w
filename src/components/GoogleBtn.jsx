import { useContext } from "react";
import { UserContext } from "../contexts/userContext";
import { FcGoogle } from "react-icons/fc"; //icône Google

export default function GoogleBtn({ children }) {
  const { loginWithGoogle } = useContext(UserContext);

  return (
    <button
      onClick={loginWithGoogle}
      className="flex items-center text-sm gap-2 rounded-3xl bg-white border hover:cursor-pointer border-gray-300 hover:border-gray-500 shadow px-4 py-2 transition-all"
    >
      <FcGoogle size={20} />
      <span className="text-black">{children}</span>
    </button>
  );
}

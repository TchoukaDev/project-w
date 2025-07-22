import { useContext } from "react";
import { UserContext } from "../contexts/userContext";
import { motion } from "framer-motion";

export default function Messages() {
  const { user, loading: loadingUser } = useContext(UserContext);
  return (
    <motion.main
      className="container flex-col items-center flex"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="mt-5">Vos conversations:</h1>
    </motion.main>
  );
}

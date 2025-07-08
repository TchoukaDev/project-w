import { Outlet } from "react-router";
import { motion } from "framer-motion";

export default function SettingsLayout() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="container px-16 py-8"
    >
      <div className="font-semibold text-xl mb-8">
        Préférences
        <hr className="mt-5 text-gray-500" />
      </div>
      <Outlet />
    </motion.div>
  );
}

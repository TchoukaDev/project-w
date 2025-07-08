import { Link } from "react-router";
import { motion } from "framer-motion";

export default function SettingsIndex() {
  const links = {
    "Informations personnelles": "infos",
    "Modifier le mot de passe": "changePassword",
    Langue: "langage",
  };
  return (
    <motion.main
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <ul>
        {Object.entries(links).map(([label, path]) => (
          <li key={label} className="mb-5">
            <Link
              className=" text-gray-500 hover:text-white transition-colors duration-300"
              to={path}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline mr-2 text-blue-600"
              >
                <path d="M6 4l8 6-8 6V4z" />
              </svg>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.main>
  );
}

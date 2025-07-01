import { Link } from "react-router";

export default function SettingsIndex() {
  const links = {
    "Informations personnelles": "infos",
    Langue: "langage",
  };
  return (
    <div>
      {Object.entries(links).map(([label, path]) => (
        <Link key={label} to={path}>
          {label}
        </Link>
      ))}
    </div>
  );
}

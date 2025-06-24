import { useState } from "react";
import { NavLink } from "react-router";

export default function Nav() {
  const navLinks = {
    Accueil: "/",
    Profil: "/profile",
    Notifications: "/notifications",
    Messages: "/messages",
    Paramètres: "/settings",
  };
  const [showNav, setShowNav] = useState(false);

  return (
    <nav className="flex justify-between items-center h-[100px] shadow-custom py-5 px-10 relative">
      <img className="h-full object-contain" src="/logo.svg" alt="logo W"></img>
      <button className="md:hidden" onClick={() => setShowNav((prev) => !prev)}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {showNav ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      <div
        className={`${
          showNav
            ? "absolute top-full mt-6 md:mt-0 flex flex-col justify-end z-10 md:static md:flex-row md:justify-between  md:items-center md:gap-3"
            : "hidden md:flex md:justify-between  md:items-center md:gap-3"
        }`}
      >
        {Object.entries(navLinks).map(([label, path]) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              isActive
                ? "bg-gray-300/40 p-3 font-semibold rounded-3xl"
                : "p-3 rounded-3xl hover:bg-gray-300/20"
            }
          >
            {" "}
            {label}{" "}
          </NavLink>
        ))}
      </div>
      <div>Votre profil</div>
    </nav>
  );
}

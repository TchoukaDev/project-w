import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/themeContext";

export default function ToggleTheme() {
  const { toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Moon />
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="relative w-14 h-8 bg-gray-300 cursor-pointer dark:bg-gray-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span
          className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform
          translate-x-0 dark:translate-x-6"
        />
      </button>
      <Sun />
    </div>
  );
}

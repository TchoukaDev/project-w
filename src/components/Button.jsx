export default function Button({
  children,
  disabled,
  type,
  margin,
  onClick,
  blueVariant,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={` ${
        blueVariant
          ? "bg-blue-700 dark:bg-blue-800 hover:bg-blue-700/70 dark:hover:bg-blue-800/70"
          : "bg-blue-500 dark:bg-blue-600  hover:bg-blue-500/70 dark:hover:bg-blue-600/70"
      }  rounded-3xl px-4 py-2 border text-white border-transparent text-center font-semibold text-sm  hover:border-black dark:hover:border-white cursor-pointer transition-color duration-300 ${margin}`}
    >
      {children}
    </button>
  );
}

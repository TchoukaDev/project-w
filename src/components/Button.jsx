export default function Button({
  children,
  disabled,
  type,
  margin,
  onClick,
  blueVariant,
  isFollowing,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={` ${
        blueVariant
          ? "bg-blue-700 dark:bg-blue-800 hover:bg-blue-700/70 dark:hover:bg-blue-800/70"
          : `${
              isFollowing
                ? "bg-blue-900 !text-white"
                : "bg-blue-500 dark:bg-blue-600  hover:bg-blue-500/70 dark:hover:bg-blue-600/70"
            }`
      }  rounded-3xl px-4 w-[130px] py-2 border mx-auto text-white border-transparent text-center font-semibold text-sm  hover:border-black dark:hover:border-white cursor-pointer transition-color duration-300 transition-all ${margin}`}
    >
      {children}
    </button>
  );
}

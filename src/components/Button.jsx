export default function Button({ children, disabled, type, margin, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={` bg-blue-500 dark:bg-blue-600 rounded-3xl px-4 py-2 border text-white border-transparent text-center font-semibold text-sm hover:bg-blue-600/70 hover:border-black dark:hover:border-white cursor-pointer transition-color duration-300 ${margin}`}
    >
      {children}
    </button>
  );
}

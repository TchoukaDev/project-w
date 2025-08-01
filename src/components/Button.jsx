export default function Button({ children, disabled, type, margin, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`bg-gray-300/30 rounded-3xl px-4 py-2 text-center font-semibold text-sm hover:bg-blue-600 cursor-pointer transition-color duration-300 ${margin}`}
    >
      {children}
    </button>
  );
}

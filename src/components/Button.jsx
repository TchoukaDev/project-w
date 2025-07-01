export default function Button({ value, disabled, type, margin, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`bg-gray-300/30 rounded-3xl p-4 font-semibold hover:bg-blue-400 cursor-pointer transition-color duration-300 ${margin}`}
    >
      {value}
    </button>
  );
}

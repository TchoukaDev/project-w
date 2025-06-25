export default function Button({ value, disabled, type, margin }) {
  return (
    <button
      disabled={disabled}
      type={type}
      className={`bg-gray-300/30 rounded-3xl p-4 font-semibold hover:bg-gray-300 hover:text-black cursor-pointer transition-color duration-300 ${margin}`}
    >
      {value}
    </button>
  );
}

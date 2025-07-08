export default function Logo({ size = "lg", onClick, canBeClicked }) {
  const sizeClasses = {
    sm: {
      img: "max-h-[80px]",
      text: "-ml-2 text-2xl",
    },
    md: {
      img: "max-h-[150px]",
      text: "-ml-5 text-4xl",
    },
    lg: {
      img: "max-h-[400px]",
      text: "-ml-15 text-7xl",
    },
  };

  const selected = sizeClasses[size] || sizeClasses.lg;

  return (
    <div
      onClick={onClick}
      className={`flex justify-center items-center ${
        canBeClicked && "cursor-pointer"
      }`}
    >
      <img className={`${selected.img}`} src="/public/logo.svg" />
      <span className={`${selected.text} font-bold italic !font-pompiere`}>
        aves
      </span>
    </div>
  );
}

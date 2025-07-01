export default function Logo({ small }) {
  return (
    <div className="flex justify-center items-center">
      <img
        className={`${small ? "max-h-[150px]" : "max-h-[400px]"}`}
        src="/public/logo.svg"
      />
      <span
        className={`${
          small
            ? "-ml-5 text-4xl font-bold italic !font-pompiere"
            : "-ml-15 text-7xl font-bold italic !font-pompiere"
        }`}
      >
        aves
      </span>{" "}
    </div>
  );
}

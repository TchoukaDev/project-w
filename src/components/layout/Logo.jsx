export default function Logo() {
  return (
    <div className="flex justify-center items-center shadow-custom">
      <img className="max-h-[100px]" src="/public/logo.svg" />
      <span className="-ml-4 text-4xl font-bold italic font-pompiere">
        aves
      </span>{" "}
    </div>
  );
}

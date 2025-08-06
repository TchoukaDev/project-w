export default function Footer() {
  const date = new Date().getFullYear();

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 bg-gray-400 dark:bg-gray-900 items-start sm:items-center px-20 py-10 mt-5">
      <div className=" mx-auto text-sm">
        © {date} Waves. Tout droit réservé.{" "}
      </div>
      <div className="!font-pompiere text-xl text-blue-800 dark:text-blue-600 mx-auto">
        ~ TchoukaDev ~
      </div>
    </div>
  );
}

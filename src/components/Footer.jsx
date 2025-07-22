export default function Footer() {
  const date = new Date().getFullYear();

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 bg-gray-900 items-start sm:items-center px-20 py-10 mt-5">
      <div className="text-sm">© {date} Waves. Tout droit réservés. </div>
      <div className="!font-pompiere text-xl text-blue-600">TchoukaDev</div>
    </div>
  );
}

import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="text-slate-600">La dirección no existe.</p>
      <Link to="/" className="font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFoundPage;

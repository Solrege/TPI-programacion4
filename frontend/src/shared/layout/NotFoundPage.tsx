import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Página no encontrada</h1>
      <p className="text-slate-600 dark:text-slate-400">La dirección no existe.</p>
      <Link to="/" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFoundPage;

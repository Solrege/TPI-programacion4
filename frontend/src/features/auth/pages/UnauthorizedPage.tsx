import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Sin permiso</h1>
      <p className="text-slate-600">Tu usuario no tiene acceso a esta sección.</p>
      <Link to="/" className="font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </section>
  );
}

export default UnauthorizedPage;

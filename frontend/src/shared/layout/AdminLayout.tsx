import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

function claseSeccion({ isActive }: { isActive: boolean }) {
  return `whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "border-orange-600 text-orange-700"
      : "border-transparent text-slate-600 hover:text-slate-900"
  }`;
}

function AdminLayout() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de administración</h1>
        <nav aria-label="Secciones del panel" className="mt-3 flex overflow-x-auto border-b border-slate-200">
          {SECCIONES.map((seccion) => (
            <NavLink key={seccion.to} to={seccion.to} className={claseSeccion}>
              {seccion.texto}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </section>
  );
}

export default AdminLayout;

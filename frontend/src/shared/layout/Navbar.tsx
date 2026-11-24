import { Link, NavLink, useNavigate } from "react-router-dom";
import BotonTema from "@/shared/components/BotonTema";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const ROLES = { admin: "Administrador", user: "Cliente" } as const;

function claseEnlace({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
  }`;
}

function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const cantidadEnCarrito = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.cantidad, 0),
  );
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-xl font-bold text-brand-600 dark:text-brand-400">
          Food Store
        </Link>

        <NavLink to="/" end className={claseEnlace}>
          Catálogo
        </NavLink>
        <NavLink to="/carrito" className={claseEnlace}>
          Carrito
          {cantidadEnCarrito > 0 && (
            <span className="ml-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
              {cantidadEnCarrito}
            </span>
          )}
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={claseEnlace}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === "admin" && (
          <NavLink to="/admin/resumen" className={claseEnlace}>
            Panel
          </NavLink>
        )}

        <div className="ml-auto flex items-center gap-3">
          <BotonTema />
          {usuario ? (
            <>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {usuario.full_name}
                <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">({ROLES[usuario.role]})</span>
              </span>
              <Button variante="secundario" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/usuarios/types/usuario";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  roles?: Rol[];
}

function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
        <span className="size-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
        Verificando sesión...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

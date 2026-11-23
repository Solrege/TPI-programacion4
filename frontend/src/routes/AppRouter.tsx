import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";
import AdminResumenPage from "@/features/pedidos/pages/AdminResumenPage";
import CarritoPage from "@/features/pedidos/pages/CarritoPage";
import CheckoutPage from "@/features/pedidos/pages/CheckoutPage";
import MisPedidosPage from "@/features/pedidos/pages/MisPedidosPage";
import CatalogoPage from "@/features/productos/pages/CatalogoPage";
import AdminLayout from "@/shared/layout/AdminLayout";
import MainLayout from "@/shared/layout/MainLayout";
import NotFoundPage from "@/shared/layout/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="resumen" replace />} />
              <Route path="resumen" element={<AdminResumenPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

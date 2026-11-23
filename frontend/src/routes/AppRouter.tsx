import { BrowserRouter, Route, Routes } from "react-router-dom";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";
import MainLayout from "@/shared/layout/MainLayout";
import NotFoundPage from "@/shared/layout/NotFoundPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

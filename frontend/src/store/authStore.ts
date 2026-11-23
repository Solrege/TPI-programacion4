import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/features/auth/api/auth";
import type { Credenciales } from "@/features/auth/types/auth";
import type { Usuario } from "@/features/usuarios/types/usuario";
import { configurarSesionInvalida } from "@/shared/api/axiosInstance";
import { queryClient } from "@/shared/api/queryClient";
import { useCartStore } from "./cartStore";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (credenciales: Credenciales) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        await authApi.login(credenciales);
        const usuario = await authApi.getMe();
        set({ usuario });
      },

      logout: async () => {
        await authApi.logout().catch(() => undefined);
        useCartStore.getState().vaciar();
        useAuthStore.getState().limpiar();
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await authApi.getMe();
          set({ usuario });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      limpiar: () => {
        set({ usuario: null });
        queryClient.clear();
      },
    }),
    {
      name: "food-store-auth",
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

configurarSesionInvalida(() => useAuthStore.getState().limpiar());

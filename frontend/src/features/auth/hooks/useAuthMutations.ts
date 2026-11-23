import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { registrar } from "../api/auth";
import type { Credenciales, RegistroData } from "../types/auth";

export function useLogin() {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (credenciales: Credenciales) => login(credenciales),
  });
}

export function useRegistro() {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: async (datos: RegistroData) => {
      await registrar(datos);
      await login({ username: datos.username, password: datos.password });
    },
  });
}

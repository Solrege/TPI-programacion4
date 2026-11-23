import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activarUsuario, desactivarUsuario } from "../api/usuarios";

function useInvalidarUsuarios() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
}

export function useActivarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({ mutationFn: activarUsuario, onSuccess: invalidar });
}

export function useDesactivarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({ mutationFn: desactivarUsuario, onSuccess: invalidar });
}

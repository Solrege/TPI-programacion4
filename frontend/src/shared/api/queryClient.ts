import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const MAX_REINTENTOS = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (intentos, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const esErrorCliente = status !== undefined && status < 500;
        return !esErrorCliente && intentos < MAX_REINTENTOS;
      },
    },
  },
});

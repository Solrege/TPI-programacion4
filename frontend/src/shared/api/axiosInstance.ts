import axios from "axios";

const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];
const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

let alInvalidarSesion: () => void = () => {};

export function configurarSesionInvalida(handler: () => void): void {
  alInvalidarSesion = handler;
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? "";
      const excluida = RUTAS_SIN_LIMPIEZA.some((ruta) => url.endsWith(ruta));
      const desactivada =
        status === 400 &&
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        data.detail === CUENTA_DESACTIVADA;

      if ((status === 401 && !excluida) || desactivada) {
        alInvalidarSesion();
      }
    }
    return Promise.reject(error);
  },
);

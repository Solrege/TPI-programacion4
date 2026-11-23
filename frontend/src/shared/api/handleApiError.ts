import axios from "axios";

interface ErrorValidacion {
  loc: (string | number)[];
  msg: string;
}

function esErrorValidacion(valor: unknown): valor is ErrorValidacion {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "loc" in valor &&
    "msg" in valor &&
    Array.isArray(valor.loc)
  );
}

function mensajeDesdeDetail(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const mensajes = detail.filter(esErrorValidacion).map((error) => {
      const campo = error.loc.filter((parte) => parte !== "body").join(".");
      return campo ? `${campo}: ${error.msg}` : error.msg;
    });
    return mensajes.length > 0 ? mensajes.join(" · ") : null;
  }
  return null;
}

export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Ocurrió un error inesperado";
  }
  if (!error.response) {
    return "No se pudo conectar con el servidor";
  }
  const { status, data } = error.response;
  const detail =
    typeof data === "object" && data !== null && "detail" in data
      ? data.detail
      : undefined;
  return mensajeDesdeDetail(detail) ?? `Error ${status} al comunicarse con el servidor`;
}

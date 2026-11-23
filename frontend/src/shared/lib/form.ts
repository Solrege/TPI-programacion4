interface MetaCampo {
  isTouched: boolean;
  errors: unknown[];
}

type Validador = (args: { value: string }) => string | undefined;

export function errorDelCampo(meta: MetaCampo): string | undefined {
  if (!meta.isTouched) {
    return undefined;
  }
  const error = meta.errors.find((e) => typeof e === "string");
  return typeof error === "string" ? error : undefined;
}

export const requerido =
  (mensaje: string): Validador =>
  ({ value }) =>
    value.trim() ? undefined : mensaje;

export const longitud =
  (campo: string, min: number, max?: number): Validador =>
  ({ value }) => {
    const largo = value.trim().length;
    if (largo < min) {
      return min === 1 ? `${campo} es obligatorio` : `${campo}: mínimo ${min} caracteres`;
    }
    if (max !== undefined && largo > max) {
      return `${campo}: máximo ${max} caracteres`;
    }
    return undefined;
  };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validarEmail: Validador = ({ value }) => {
  if (!value.trim()) {
    return "El email es obligatorio";
  }
  return EMAIL_REGEX.test(value.trim()) ? undefined : "Ingresá un email válido";
};

export const numeroMinimo =
  (campo: string, min: number, entero = false) =>
  ({ value }: { value: number }) => {
    if (Number.isNaN(value)) {
      return `${campo} es obligatorio`;
    }
    if (entero && !Number.isInteger(value)) {
      return `${campo} debe ser un número entero`;
    }
    return value < min ? `${campo} no puede ser menor a ${min}` : undefined;
  };

export const valorNumerico = (valor: number) => (Number.isNaN(valor) ? "" : valor);

export const ajustarCantidad = (valor: number, max: number) =>
  Number.isNaN(valor) ? 1 : Math.min(Math.max(Math.trunc(valor), 1), Math.max(max, 1));

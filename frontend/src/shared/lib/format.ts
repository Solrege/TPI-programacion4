const PRECIO = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

export function formatearPrecio(valor: number): string {
  return PRECIO.format(valor);
}

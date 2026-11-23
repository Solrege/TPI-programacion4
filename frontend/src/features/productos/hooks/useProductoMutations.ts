import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
} from "../api/productos";
import type { ProductoCreate, ProductoStockUpdate, ProductoUpdate } from "../types/producto";

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => crearProducto(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) =>
      actualizarProducto(id, datos),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) =>
      actualizarStock(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: invalidar,
  });
}

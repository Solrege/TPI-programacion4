import { axiosInstance } from "@/shared/api/axiosInstance";
import type {
  CambioEstado,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>("/pedidos", datos);
  return data;
}

export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
    params: filtros,
  });
  return data;
}

export async function cancelarPedido(pedidoId: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${pedidoId}/cancelar`);
  return data;
}

export async function cambiarEstadoPedido({
  id,
  datos,
}: {
  id: number;
  datos: CambioEstado;
}): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, datos);
  return data;
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

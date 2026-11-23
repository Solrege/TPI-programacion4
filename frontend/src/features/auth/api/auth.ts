import type { Usuario } from "@/features/usuarios/types/usuario";
import { axiosInstance } from "@/shared/api/axiosInstance";
import type { Credenciales, MessageResponse, RegistroData } from "../types/auth";

export async function login(credenciales: Credenciales): Promise<MessageResponse> {
  const form = new URLSearchParams({
    username: credenciales.username,
    password: credenciales.password,
  });
  const { data } = await axiosInstance.post<MessageResponse>("/auth/token", form);
  return data;
}

export async function registrar(datos: RegistroData): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>("/auth/register", datos);
  return data;
}

export async function logout(): Promise<MessageResponse> {
  const { data } = await axiosInstance.post<MessageResponse>("/auth/logout");
  return data;
}

export async function getMe(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>("/auth/me");
  return data;
}

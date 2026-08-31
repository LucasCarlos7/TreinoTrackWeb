import axios from "axios";
import { clearStoredAuth, getStoredAuth } from "@/shared/auth/authStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Anexa o JWT em toda requisição, quando o usuário está autenticado.
apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Normaliza erros da API (Result Pattern do backend: { code, message }) num formato previsível.
// Um 401 indica token ausente/expirado — limpa a sessão local para o RequireAuth mandar pro login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth();
    }

    const apiError = error?.response?.data;
    if (apiError?.code && apiError?.message) {
      return Promise.reject(new Error(apiError.message));
    }
    return Promise.reject(error);
  }
);

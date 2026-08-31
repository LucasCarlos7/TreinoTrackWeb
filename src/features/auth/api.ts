import { apiClient } from "@/shared/api/client";
import type { AuthResponseDto } from "@/shared/api/types";

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponseDto> => {
    const { data } = await apiClient.post<AuthResponseDto>("/auth/register", { email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponseDto> => {
    const { data } = await apiClient.post<AuthResponseDto>("/auth/login", { email, password });
    return data;
  },
};

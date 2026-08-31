import { apiClient } from "@/shared/api/client";
import type { ProgressionCycleDto, WorkoutSplitDto } from "@/shared/api/types";

export const trainingApi = {
  getActiveSplit: async (): Promise<WorkoutSplitDto> => {
    const { data } = await apiClient.get<WorkoutSplitDto>("/training/splits/active");
    return data;
  },

  getProgressionCycle: async (cycleId: string): Promise<ProgressionCycleDto> => {
    const { data } = await apiClient.get<ProgressionCycleDto>(`/training/progression-cycles/${cycleId}`);
    return data;
  },

  logSet: async (
    weekId: string,
    payload: { exerciseName: string; loadKg: number; repsPerformed: number; rir?: number; note?: string }
  ): Promise<string> => {
    const { data } = await apiClient.post<string>(`/training/progression-weeks/${weekId}/logs`, payload);
    return data;
  },
};

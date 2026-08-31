import { apiClient } from "@/shared/api/client";
import type {
  BodyMeasurementDto,
  ChecklistCategory,
  DailyChecklistEntryDto,
  GoalDto,
  GoalMetric,
  GoalPeriod,
} from "@/shared/api/types";

export const progressApi = {
  getMeasurements: async (from?: string, to?: string): Promise<BodyMeasurementDto[]> => {
    const { data } = await apiClient.get<BodyMeasurementDto[]>("/progress/measurements", {
      params: { from, to },
    });
    return data;
  },

  addMeasurement: async (payload: {
    date: string;
    weightKg: number;
    armCm?: number;
    chestCm?: number;
    waistCm?: number;
    thighCm?: number;
    calfCm?: number;
    photoTaken: boolean;
  }): Promise<string> => {
    const { data } = await apiClient.post<string>("/progress/measurements", payload);
    return data;
  },

  getGoals: async (period?: GoalPeriod): Promise<GoalDto[]> => {
    const { data } = await apiClient.get<GoalDto[]>("/progress/goals", { params: { period } });
    return data;
  },

  createGoal: async (payload: {
    period: GoalPeriod;
    metric: GoalMetric;
    targetValue: number;
    targetDate: string;
  }): Promise<string> => {
    const { data } = await apiClient.post<string>("/progress/goals", payload);
    return data;
  },

  markGoalAchieved: async (goalId: string): Promise<void> => {
    await apiClient.patch(`/progress/goals/${goalId}/achieve`);
  },

  getChecklistByDate: async (date: string): Promise<DailyChecklistEntryDto[]> => {
    const { data } = await apiClient.get<DailyChecklistEntryDto[]>("/progress/checklist", {
      params: { date },
    });
    return data;
  },

  addChecklistEntry: async (payload: {
    date: string;
    category: ChecklistCategory;
    item: string;
  }): Promise<string> => {
    const { data } = await apiClient.post<string>("/progress/checklist", payload);
    return data;
  },

  markChecklistDone: async (entryId: string, note?: string): Promise<void> => {
    await apiClient.patch(`/progress/checklist/${entryId}/done`, { note });
  },
};

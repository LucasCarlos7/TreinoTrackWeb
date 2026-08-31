import { apiClient } from "@/shared/api/client";
import type { CompleteOnboardingRequest, OnboardingResultDto } from "@/shared/api/types";

export const onboardingApi = {
  complete: async (payload: CompleteOnboardingRequest): Promise<OnboardingResultDto> => {
    const { data } = await apiClient.post<OnboardingResultDto>("/onboarding/complete", payload);
    return data;
  },
};

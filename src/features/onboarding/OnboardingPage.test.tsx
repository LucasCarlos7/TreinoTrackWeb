import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingPage } from "./OnboardingPage";
import { onboardingApi } from "./api";
import { renderWithClient } from "@/test/test-utils";
import type { OnboardingResultDto } from "@/shared/api/types";

vi.mock("./api", () => ({
  onboardingApi: {
    complete: vi.fn(),
  },
}));

const result: OnboardingResultDto = {
  workoutSplitId: "split-1",
  mealPlanId: "plan-1",
  goalId: "goal-1",
  bodyMeasurementId: "measurement-1",
  tdeeKcal: 2500,
  caloriesMin: 2600,
  caloriesMax: 2800,
  proteinGrams: 160,
  carbGrams: 300,
  fatGrams: 70,
  waterLiters: 2.8,
  targetWeightKg: 83,
};

beforeEach(() => {
  vi.mocked(onboardingApi.complete).mockReset();
});

describe("OnboardingPage", () => {
  it("envia os dados preenchidos e mostra o resumo do plano gerado", async () => {
    const user = userEvent.setup();
    vi.mocked(onboardingApi.complete).mockResolvedValue(result);

    renderWithClient(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Peso (kg)"), "80");
    await user.type(screen.getByLabelText("Altura (cm)"), "180");
    await user.type(screen.getByLabelText("Idade"), "28");
    await user.click(screen.getByRole("button", { name: "Gerar plano" }));

    await waitFor(() =>
      expect(onboardingApi.complete).toHaveBeenCalledWith(
        expect.objectContaining({ weightKg: 80, heightCm: 180, age: 28, sex: 1, objective: 1 })
      )
    );

    expect(await screen.findByText("Plano gerado!")).toBeInTheDocument();
    expect(screen.getByText("2500 kcal/dia")).toBeInTheDocument();
  });

  it("mostra erro quando a geração do plano falha", async () => {
    const user = userEvent.setup();
    vi.mocked(onboardingApi.complete).mockRejectedValue(new Error("Idade fora da faixa suportada (13-100)."));

    renderWithClient(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Peso (kg)"), "80");
    await user.type(screen.getByLabelText("Altura (cm)"), "180");
    await user.type(screen.getByLabelText("Idade"), "20");
    await user.click(screen.getByRole("button", { name: "Gerar plano" }));

    expect(await screen.findByText("Idade fora da faixa suportada (13-100).")).toBeInTheDocument();
  });
});

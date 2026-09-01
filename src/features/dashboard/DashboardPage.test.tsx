import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import { trainingApi } from "@/features/training/api";
import { progressApi } from "@/features/progress/api";
import { renderWithClient } from "@/test/test-utils";
import type { GoalDto, WorkoutSplitDto } from "@/shared/api/types";

vi.mock("@/features/training/api", () => ({
  trainingApi: { getActiveSplit: vi.fn(), logSet: vi.fn() },
}));

vi.mock("@/features/progress/api", () => ({
  progressApi: { getGoals: vi.fn() },
}));

const split: WorkoutSplitDto = {
  id: "split-1",
  name: "Split ABC",
  isActive: true,
  days: [
    {
      id: "day-1",
      type: 1,
      label: "Push Day",
      exercises: [
        { id: "ex-1", name: "Supino", order: 1, sets: 3, repRange: "8-12", restTime: "90s", isCardio: false },
      ],
    },
  ],
};

const goals: GoalDto[] = [
  { id: "goal-1", period: 1, metric: 1, targetValue: 82, targetDate: "2026-10-15", achieved: false },
  { id: "goal-2", period: 1, metric: 4, targetValue: 84, targetDate: "2026-07-20", achieved: true },
];

beforeEach(() => {
  vi.mocked(trainingApi.getActiveSplit).mockResolvedValue(split);
  vi.mocked(progressApi.getGoals).mockResolvedValue(goals);
});

describe("DashboardPage", () => {
  it("renderiza a divisão ativa e as metas pendentes", async () => {
    renderWithClient(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Split ABC")).toBeInTheDocument();
    expect(screen.getByText(/Push Day/)).toBeInTheDocument();
    expect(screen.getByText(/Peso: alvo 82/)).toBeInTheDocument();
    expect(screen.queryByText(/Cintura: alvo 84/)).not.toBeInTheDocument();
  });

  it("redireciona para /plano quando não há divisão de treino ativa", async () => {
    vi.mocked(trainingApi.getActiveSplit).mockResolvedValue(null);

    renderWithClient(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plano" element={<div>Página de geração de plano</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Página de geração de plano")).toBeInTheDocument();
  });
});

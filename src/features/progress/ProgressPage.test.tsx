import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressPage } from "./ProgressPage";
import { progressApi } from "./api";
import { renderWithClient } from "@/test/test-utils";

vi.mock("./api", () => ({
  progressApi: {
    getMeasurements: vi.fn(),
    getGoals: vi.fn(),
    getChecklistByDate: vi.fn(),
    markChecklistDone: vi.fn(),
    markGoalAchieved: vi.fn(),
    createGoal: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(progressApi.getMeasurements).mockResolvedValue([]);
  vi.mocked(progressApi.getGoals).mockResolvedValue([]);
  vi.mocked(progressApi.getChecklistByDate).mockResolvedValue([]);
  vi.mocked(progressApi.createGoal).mockResolvedValue("goal-1");
});

describe("ProgressPage", () => {
  it("mostra estados vazios quando não há dados", async () => {
    renderWithClient(<ProgressPage />);

    expect(await screen.findByText("Nenhuma medição registrada ainda.")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma meta cadastrada ainda.")).toBeInTheDocument();
    expect(screen.getByText("Nenhum item no checklist de hoje.")).toBeInTheDocument();
  });

  it("cria uma nova meta pelo formulário", async () => {
    const user = userEvent.setup();
    renderWithClient(<ProgressPage />);

    await screen.findByText("Nenhuma meta cadastrada ainda.");
    await user.type(screen.getByLabelText("Valor alvo"), "80");
    await user.type(screen.getByLabelText("Data alvo"), "2026-12-01");
    await user.click(screen.getByRole("button", { name: "Criar meta" }));

    await waitFor(() =>
      expect(progressApi.createGoal).toHaveBeenCalledWith(
        expect.objectContaining({ period: 1, metric: 1, targetValue: 80, targetDate: "2026-12-01" })
      )
    );
  });
});

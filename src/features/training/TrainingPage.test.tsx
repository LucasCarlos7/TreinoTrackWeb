import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrainingPage } from "./TrainingPage";
import { trainingApi } from "./api";
import { renderWithClient } from "@/test/test-utils";
import type { WorkoutSplitDto } from "@/shared/api/types";

vi.mock("./api", () => ({
  trainingApi: {
    getActiveSplit: vi.fn(),
    logSet: vi.fn(),
  },
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

beforeEach(() => {
  vi.mocked(trainingApi.getActiveSplit).mockResolvedValue(split);
  vi.mocked(trainingApi.logSet).mockResolvedValue("log-1");
  localStorage.clear();
});

describe("TrainingPage", () => {
  it("renderiza a divisão ativa e os exercícios", async () => {
    renderWithClient(<TrainingPage />);

    expect(await screen.findByText("Split ABC")).toBeInTheDocument();
    expect(screen.getByText("Supino")).toBeInTheDocument();
  });

  it("pede o ID da semana antes de permitir registrar uma série", async () => {
    const user = userEvent.setup();
    renderWithClient(<TrainingPage />);

    await screen.findByText("Supino");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    expect(screen.getByText(/Configure o ID da semana ativa/)).toBeInTheDocument();
  });

  it("registra uma série quando o weekId está preenchido", async () => {
    const user = userEvent.setup();
    renderWithClient(<TrainingPage />);

    await screen.findByText("Supino");
    await user.type(screen.getByPlaceholderText("ID da semana (weekId)"), "week-123");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await user.type(screen.getByLabelText("Carga (kg)"), "80");
    await user.type(screen.getByLabelText("Reps"), "10");
    await user.click(screen.getByRole("button", { name: "Salvar série" }));

    await waitFor(() =>
      expect(trainingApi.logSet).toHaveBeenCalledWith(
        "week-123",
        expect.objectContaining({ exerciseName: "Supino", loadKg: 80, repsPerformed: 10 })
      )
    );
  });

  it("redireciona para /plano quando não há divisão de treino ativa", async () => {
    vi.mocked(trainingApi.getActiveSplit).mockResolvedValue(null);

    renderWithClient(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TrainingPage />} />
          <Route path="/plano" element={<div>Página de geração de plano</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Página de geração de plano")).toBeInTheDocument();
  });
});

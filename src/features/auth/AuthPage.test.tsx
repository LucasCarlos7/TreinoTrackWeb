import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPage } from "./AuthPage";
import { authApi } from "./api";
import { AuthProvider } from "@/shared/auth/AuthContext";
import { renderWithClient } from "@/test/test-utils";

vi.mock("./api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

function renderAuthPage() {
  return renderWithClient(
    <MemoryRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(authApi.login).mockReset();
  vi.mocked(authApi.register).mockReset();
});

describe("AuthPage", () => {
  it("faz login com e-mail e senha preenchidos", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      token: "token-abc",
      expiresAtUtc: "2026-01-01T00:00:00Z",
    });

    renderAuthPage();

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "P@ssw0rd123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith("user@example.com", "P@ssw0rd123")
    );
  });

  it("mostra erro quando o login falha", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockRejectedValue(new Error("E-mail ou senha inválidos."));

    renderAuthPage();

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail ou senha inválidos.")).toBeInTheDocument();
  });

  it("alterna para o modo de cadastro e registra um novo usuário", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockResolvedValue({
      userId: "user-2",
      email: "novo@example.com",
      token: "token-xyz",
      expiresAtUtc: "2026-01-01T00:00:00Z",
    });

    renderAuthPage();

    await user.click(screen.getByRole("button", { name: "Não tem conta? Criar uma" }));
    await user.type(screen.getByLabelText("E-mail"), "novo@example.com");
    await user.type(screen.getByLabelText("Senha"), "P@ssw0rd123");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() =>
      expect(authApi.register).toHaveBeenCalledWith("novo@example.com", "P@ssw0rd123")
    );
  });
});

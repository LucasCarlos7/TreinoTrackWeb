import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthContext";

type Mode = "login" | "register";

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message || "Não foi possível continuar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>{mode === "login" ? "Entrar" : "Criar conta"}</h1>

      <section className="card">
        <form className="inline-form" onSubmit={handleSubmit}>
          <label>
            <span>E-mail</span>
            <input
              className="text-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Senha</span>
            <input
              className="text-input"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="page-state page-state--error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            setMode((current) => (current === "login" ? "register" : "login"));
            setError(null);
          }}
        >
          {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </section>
    </div>
  );
}

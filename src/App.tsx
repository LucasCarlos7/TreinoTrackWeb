import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { NavBar } from "@/shared/components/NavBar";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { useAuth } from "@/shared/auth/AuthContext";
import { AuthPage } from "@/features/auth/AuthPage";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { TrainingPage } from "@/features/training/TrainingPage";
import { NutritionPage } from "@/features/nutrition/NutritionPage";
import { ProgressPage } from "@/features/progress/ProgressPage";

export default function App() {
  const { auth, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__row">
            <h1 className="app-title"><Link to="/">TreinoTrack</Link></h1>
            {auth && (
              <button type="button" className="button-secondary app-header__logout" onClick={logout}>
                Sair
              </button>
            )}
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/treino" element={<RequireAuth><TrainingPage /></RequireAuth>} />
            <Route path="/plano" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
            <Route path="/nutricao" element={<RequireAuth><NutritionPage /></RequireAuth>} />
            <Route path="/progresso" element={<RequireAuth><ProgressPage /></RequireAuth>} />
          </Routes>
        </main>

        {auth && <NavBar />}
      </div>
    </BrowserRouter>
  );
}

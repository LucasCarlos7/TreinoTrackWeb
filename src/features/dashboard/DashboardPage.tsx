import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { trainingApi } from "@/features/training/api";
import { progressApi } from "@/features/progress/api";
import { SkeletonCard } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { WORKOUT_DAY_TYPE_LABELS, GOAL_METRIC_LABELS, GOAL_PERIOD_LABELS } from "@/shared/api/enums";

const TODAY_LABEL = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: split, isLoading: loadingSplit, isError, error } = useQuery({
    queryKey: ["training", "active-split"],
    queryFn: trainingApi.getActiveSplit,
  });

  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ["progress", "goals"],
    queryFn: () => progressApi.getGoals(),
  });

  if (isError) return <div className="page-state page-state--error">{(error as Error).message}</div>;

  if (loadingSplit) {
    return (
      <div className="page page--treino">
        <h1>TreinoTrack</h1>
        <SkeletonCard lines={3} />
        <SkeletonCard lines={2} />
      </div>
    );
  }

  if (!split) {
    return <Navigate to="/plano" replace state={{ reason: "no-active-split" }} />;
  }

  const pendingGoals = (goals ?? []).filter((g) => !g.achieved).slice(0, 3);

  return (
    <div className="page page--treino">
      <p className="eyebrow">{TODAY_LABEL}</p>
      <h1>{split.name}</h1>

      <section className="card">
        <h2>Dias de treino</h2>
        <ul className="goal-list">
          {split.days.map((day) => (
            <li key={day.id}>
              <span>{WORKOUT_DAY_TYPE_LABELS[day.type] ?? day.type} — {day.label}</span>
              <span>{day.exercises.length} exercícios</span>
            </li>
          ))}
        </ul>
        <button type="button" className="button-block" onClick={() => navigate("/treino")}>
          Iniciar treino →
        </button>
      </section>

      <section className="card card--progresso">
        <div className="card-header">
          <h2>Metas ativas</h2>
          <Link to="/progresso" className="goal-list__link">Ver todas →</Link>
        </div>
        {loadingGoals ? (
          <SkeletonCard lines={2} />
        ) : pendingGoals.length === 0 ? (
          <EmptyState icon="🎯" title="Nenhuma meta pendente." />
        ) : (
          <ul className="goal-list">
            {pendingGoals.map((g) => (
              <li key={g.id}>
                <span>
                  [{GOAL_PERIOD_LABELS[g.period]}] {GOAL_METRIC_LABELS[g.metric]}: alvo {g.targetValue} até {g.targetDate}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { progressApi } from "./api";
import type { GoalMetric, GoalPeriod } from "@/shared/api/types";
import { SkeletonCard } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { GOAL_METRIC_LABELS, GOAL_METRIC_OPTIONS, GOAL_PERIOD_LABELS, GOAL_PERIOD_OPTIONS } from "@/shared/api/enums";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ProgressPage() {
  const queryClient = useQueryClient();
  const [date] = useState(today());

  const { data: measurements, isLoading: loadingMeasurements } = useQuery({
    queryKey: ["progress", "measurements"],
    queryFn: () => progressApi.getMeasurements(),
  });

  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ["progress", "goals"],
    queryFn: () => progressApi.getGoals(),
  });

  const { data: checklist, isLoading: loadingChecklist } = useQuery({
    queryKey: ["progress", "checklist", date],
    queryFn: () => progressApi.getChecklistByDate(date),
  });

  const markDone = useMutation({
    mutationFn: (entryId: string) => progressApi.markChecklistDone(entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress", "checklist", date] }),
  });

  const markAchieved = useMutation({
    mutationFn: (goalId: string) => progressApi.markGoalAchieved(goalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress", "goals"] }),
  });

  const chartData = (measurements ?? []).map((m) => ({ date: m.date, peso: m.weightKg }));

  return (
    <div className="page page--progresso">
      <h1>Progresso</h1>

      <section className="card">
        <h2>Evolução de peso</h2>
        {loadingMeasurements ? (
          <SkeletonCard lines={2} />
        ) : chartData.length === 0 ? (
          <EmptyState icon="📈" title="Nenhuma medição registrada ainda." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C3038" />
              <XAxis dataKey="date" stroke="#8B9099" tick={{ fill: "#8B9099", fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} stroke="#8B9099" tick={{ fill: "#8B9099", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1E2126", border: "1px solid #2C3038", color: "#ECEAE4" }} />
              <Line type="monotone" dataKey="peso" stroke="#3E7CB1" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="card">
        <h2>Metas</h2>
        <CreateGoalForm />
        {loadingGoals ? (
          <SkeletonCard lines={2} />
        ) : !goals || goals.length === 0 ? (
          <EmptyState icon="🎯" title="Nenhuma meta cadastrada ainda." />
        ) : (
          <ul className="goal-list">
            {goals.map((g) => (
              <li key={g.id} className={g.achieved ? "goal-done" : ""}>
                <span>
                  [{GOAL_PERIOD_LABELS[g.period]}] {GOAL_METRIC_LABELS[g.metric]}: alvo {g.targetValue} até {g.targetDate}
                </span>
                {!g.achieved && (
                  <button type="button" onClick={() => markAchieved.mutate(g.id)}>Marcar alcançada</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Checklist de hoje ({date})</h2>
        {loadingChecklist ? (
          <SkeletonCard lines={3} />
        ) : !checklist || checklist.length === 0 ? (
          <EmptyState icon="✅" title="Nenhum item no checklist de hoje." />
        ) : (
          <ul className="checklist">
            {checklist.map((item) => (
              <li key={item.id} className={item.done ? "checklist-done" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={item.done}
                    onChange={() => markDone.mutate(item.id)}
                  />
                  {item.item}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CreateGoalForm() {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<GoalPeriod>(1);
  const [metric, setMetric] = useState<GoalMetric>(1);
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const createGoal = useMutation({
    mutationFn: () =>
      progressApi.createGoal({
        period,
        metric,
        targetValue: Number.parseFloat(targetValue),
        targetDate,
      }),
    onSuccess: () => {
      setTargetValue("");
      setTargetDate("");
      queryClient.invalidateQueries({ queryKey: ["progress", "goals"] });
    },
  });

  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        createGoal.mutate();
      }}
    >
      <div className="inline-form__fields">
        <label>
          <span>Período</span>
          <select
            className="select-input"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value) as GoalPeriod)}
          >
            {GOAL_PERIOD_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label>
          <span>Métrica</span>
          <select
            className="select-input"
            value={metric}
            onChange={(e) => setMetric(Number(e.target.value) as GoalMetric)}
          >
            {GOAL_METRIC_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <label>
          <span>Valor alvo</span>
          <input
            className="text-input"
            type="number"
            step="0.1"
            required
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </label>
        <label>
          <span>Data alvo</span>
          <input
            className="text-input"
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </label>
      </div>
      {createGoal.isError && (
        <p className="page-state page-state--error">{(createGoal.error as Error).message}</p>
      )}
      <button type="submit" disabled={createGoal.isPending}>
        {createGoal.isPending ? "Criando..." : "Criar meta"}
      </button>
    </form>
  );
}

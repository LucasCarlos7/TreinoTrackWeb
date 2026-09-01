import type {
  ActivityLevel,
  ChecklistCategory,
  ExperienceLevel,
  FitnessObjective,
  GoalMetric,
  GoalPeriod,
  ProgressionStrategy,
  Sex,
  WorkoutDayType,
} from "./types";

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Feminino" },
];

export const ACTIVITY_LEVEL_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 1, label: "Sedentário (pouco ou nenhum exercício)" },
  { value: 2, label: "Levemente ativo (exercício leve 1-3x/semana)" },
  { value: 3, label: "Moderadamente ativo (exercício moderado 3-5x/semana)" },
  { value: 4, label: "Muito ativo (exercício intenso 6-7x/semana)" },
  { value: 5, label: "Extremamente ativo (exercício intenso + trabalho físico)" },
];

export const FITNESS_OBJECTIVE_OPTIONS: { value: FitnessObjective; label: string }[] = [
  { value: 1, label: "Hipertrofia" },
  { value: 2, label: "Emagrecimento" },
  { value: 3, label: "Recomposição corporal" },
  { value: 4, label: "Resistência cardiorrespiratória" },
  { value: 5, label: "Saúde geral" },
];

export const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 1, label: "Iniciante" },
  { value: 2, label: "Intermediário" },
  { value: 3, label: "Avançado" },
];

// Equipment é um enum de flags — cada opção é um bit independente que pode ser
// combinado por OR (ex.: Halteres(2) | Barra(4) = 6) para representar múltiplos
// equipamentos disponíveis ao mesmo tempo.
export const EQUIPMENT_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Peso corporal" },
  { value: 2, label: "Halteres" },
  { value: 4, label: "Barra" },
  { value: 8, label: "Máquina" },
  { value: 16, label: "Cabo/Polia" },
  { value: 32, label: "Kettlebell" },
  { value: 64, label: "Elástico" },
  { value: 128, label: "Bola suíça" },
  { value: 256, label: "Medicine ball" },
  { value: 512, label: "Foam roll" },
  { value: 1024, label: "Barra EZ" },
];

export const WORKOUT_DAY_TYPE_LABELS: Record<WorkoutDayType, string> = {
  1: "A — Push",
  2: "B — Pull",
  3: "C — Legs",
  4: "D — Upper",
  5: "E — Lower",
};

export const GOAL_PERIOD_OPTIONS: { value: GoalPeriod; label: string }[] = [
  { value: 1, label: "Semanal" },
  { value: 2, label: "Mensal" },
  { value: 3, label: "Anual" },
];

export const GOAL_METRIC_OPTIONS: { value: GoalMetric; label: string }[] = [
  { value: 1, label: "Peso" },
  { value: 2, label: "Braço" },
  { value: 3, label: "Peito" },
  { value: 4, label: "Cintura" },
  { value: 5, label: "Coxa" },
  { value: 6, label: "Panturrilha" },
];

export const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = Object.fromEntries(
  GOAL_PERIOD_OPTIONS.map((o) => [o.value, o.label])
) as Record<GoalPeriod, string>;

export const GOAL_METRIC_LABELS: Record<GoalMetric, string> = Object.fromEntries(
  GOAL_METRIC_OPTIONS.map((o) => [o.value, o.label])
) as Record<GoalMetric, string>;

export const CHECKLIST_CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  1: "Fora da academia",
  2: "Dentro da academia",
};

export const PROGRESSION_STRATEGY_LABELS: Record<ProgressionStrategy, string> = {
  1: "Estabilização",
  2: "Progressão de reps",
  3: "Progressão de carga",
  4: "Semi-deload",
};

// ---------- Auth ----------
export interface AuthResponseDto {
  userId: string;
  email: string;
  token: string;
  expiresAtUtc: string;
}

// ---------- Onboarding ----------
export type Sex = 1 | 2;
export type ActivityLevel = 1 | 2 | 3 | 4 | 5;
export type FitnessObjective = 1 | 2 | 3 | 4 | 5;
export type ExperienceLevel = 1 | 2 | 3;

export interface CompleteOnboardingRequest {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  objective: FitnessObjective;
  daysPerWeek: number;
  level: ExperienceLevel;
  // Equipment é um enum de flags (.NET [Flags]) — o valor enviado é o OR bit a bit
  // dos equipamentos selecionados (ex.: Halteres(2) | Barra(4) = 6).
  availableEquipment: number;
}

export interface OnboardingResultDto {
  workoutSplitId: string;
  mealPlanId: string;
  goalId: string;
  bodyMeasurementId: string;
  tdeeKcal: number;
  caloriesMin: number;
  caloriesMax: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  waterLiters: number;
  targetWeightKg: number;
}

// ---------- Training ----------
// Os enums do backend (.NET) não têm JsonStringEnumConverter configurado, então
// são serializados/desserializados como número — os tipos aqui refletem isso.
// Ver src/shared/api/enums.ts para os labels em português de cada valor.
export type WorkoutDayType = 1 | 2 | 3 | 4 | 5;

export interface WorkoutExerciseDto {
  id: string;
  name: string;
  order: number;
  sets: number;
  repRange: string;
  restTime: string;
  isCardio: boolean;
}

export interface WorkoutDayDto {
  id: string;
  type: WorkoutDayType;
  label: string;
  exercises: WorkoutExerciseDto[];
}

export interface WorkoutSplitDto {
  id: string;
  name: string;
  isActive: boolean;
  days: WorkoutDayDto[];
}

export type ProgressionStrategy = 1 | 2 | 3 | 4;

export interface SetLogDto {
  id: string;
  exerciseName: string;
  loadKg: number;
  repsPerformed: number;
  rir?: number | null;
  note?: string | null;
}

export interface ProgressionWeekDto {
  id: string;
  weekNumber: number;
  strategy: ProgressionStrategy;
  logs: SetLogDto[];
}

export interface ProgressionCycleDto {
  id: string;
  startDate: string;
  endDate: string;
  weeks: ProgressionWeekDto[];
}

// ---------- Nutrition ----------
export interface MealDto {
  id: string;
  name: string;
  order: number;
  description: string;
  proteinGrams: number;
  carbGrams: number;
}

export interface MealPlanDto {
  id: string;
  name: string;
  targetCaloriesMin: number;
  targetCaloriesMax: number;
  targetProteinGrams: number;
  targetCarbGrams: number;
  targetFatGrams: number;
  targetWaterLiters: number;
  meals: MealDto[];
}

export interface ShoppingListItemDto {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: number;
  actualPrice?: number | null;
  purchased: boolean;
  weekOf: string;
}

// ---------- Progress ----------
export interface BodyMeasurementDto {
  id: string;
  date: string;
  weightKg: number;
  armCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  thighCm?: number | null;
  calfCm?: number | null;
  photoTaken: boolean;
}

export type GoalPeriod = 1 | 2 | 3;
export type GoalMetric = 1 | 2 | 3 | 4 | 5 | 6;

export interface GoalDto {
  id: string;
  period: GoalPeriod;
  metric: GoalMetric;
  targetValue: number;
  targetDate: string;
  achieved: boolean;
}

export type ChecklistCategory = 1 | 2;

export interface DailyChecklistEntryDto {
  id: string;
  date: string;
  category: ChecklistCategory;
  item: string;
  done: boolean;
  note?: string | null;
}

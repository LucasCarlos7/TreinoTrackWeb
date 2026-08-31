import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardingApi } from "./api";
import { ACTIVITY_LEVEL_OPTIONS, FITNESS_OBJECTIVE_OPTIONS, SEX_OPTIONS } from "@/shared/api/enums";
import type { ActivityLevel, FitnessObjective, OnboardingResultDto, Sex } from "@/shared/api/types";

export function OnboardingPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [sex, setSex] = useState<Sex>(1);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(3);
  const [objective, setObjective] = useState<FitnessObjective>(1);
  const [daysPerWeek, setDaysPerWeek] = useState("4");
  const [result, setResult] = useState<OnboardingResultDto | null>(null);

  const complete = useMutation({
    mutationFn: () =>
      onboardingApi.complete({
        sex,
        weightKg: Number.parseFloat(weightKg),
        heightCm: Number.parseFloat(heightCm),
        age: Number.parseInt(age, 10),
        activityLevel,
        objective,
        daysPerWeek: Number.parseInt(daysPerWeek, 10),
      }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["training", "active-split"] });
      queryClient.invalidateQueries({ queryKey: ["progress", "goals"] });
      queryClient.invalidateQueries({ queryKey: ["progress", "measurements"] });
    },
  });

  if (result) {
    return (
      <div className="page page--plano">
        <h1>Plano gerado!</h1>
        <section className="card">
          <h2>Metas nutricionais</h2>
          <ul className="goal-list">
            <li><span>TDEE estimado</span><span>{result.tdeeKcal} kcal/dia</span></li>
            <li><span>Faixa calórica</span><span>{result.caloriesMin}–{result.caloriesMax} kcal/dia</span></li>
            <li><span>Proteína</span><span>{result.proteinGrams} g</span></li>
            <li><span>Carboidrato</span><span>{result.carbGrams} g</span></li>
            <li><span>Gordura</span><span>{result.fatGrams} g</span></li>
            <li><span>Água</span><span>{result.waterLiters} L</span></li>
            <li><span>Meta de peso (3 meses)</span><span>{result.targetWeightKg} kg</span></li>
          </ul>
        </section>
        <button type="button" onClick={() => navigate("/")}>Ver meu treino</button>
      </div>
    );
  }

  return (
    <div className="page page--plano">
      <h1>Gerar meu plano</h1>
      <p className="field-hint">
        A partir dos seus dados calculamos automaticamente suas metas de calorias e macros, uma
        meta de peso para os próximos 3 meses, e sugerimos uma divisão de treino. Isso substitui
        seu plano de treino ativo atual (se houver).
      </p>

      <section className="card">
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            complete.mutate();
          }}
        >
          <div className="inline-form__fields">
            <label>
              <span>Sexo</span>
              <select className="select-input" value={sex} onChange={(e) => setSex(Number(e.target.value) as Sex)}>
                {SEX_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label>
              <span>Peso (kg)</span>
              <input
                className="text-input" type="number" step="0.1" min="1" required
                value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
              />
            </label>
            <label>
              <span>Altura (cm)</span>
              <input
                className="text-input" type="number" step="0.1" min="1" required
                value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
              />
            </label>
            <label>
              <span>Idade</span>
              <input
                className="text-input" type="number" min="13" max="100" required
                value={age} onChange={(e) => setAge(e.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Nível de atividade</span>
            <select
              className="select-input"
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value) as ActivityLevel)}
            >
              {ACTIVITY_LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label>
            <span>Objetivo</span>
            <select
              className="select-input"
              value={objective}
              onChange={(e) => setObjective(Number(e.target.value) as FitnessObjective)}
            >
              {FITNESS_OBJECTIVE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label>
            <span>Dias de treino por semana</span>
            <input
              className="text-input" type="number" min="1" max="7" required
              value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)}
            />
          </label>

          {complete.isError && (
            <p className="page-state page-state--error">{(complete.error as Error).message}</p>
          )}

          <button type="submit" disabled={complete.isPending}>
            {complete.isPending ? "Gerando..." : "Gerar plano"}
          </button>
        </form>
      </section>
    </div>
  );
}

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { trainingApi } from "./api";
import { SkeletonCard } from "@/shared/components/Skeleton";
import { WORKOUT_DAY_TYPE_LABELS } from "@/shared/api/enums";

const ACTIVE_WEEK_STORAGE_KEY = "treinotrack:activeWeekId";

export function TrainingPage() {
  const { data: split, isLoading, isError, error } = useQuery({
    queryKey: ["training", "active-split"],
    queryFn: trainingApi.getActiveSplit,
  });

  const [weekId, setWeekId] = useState(() => localStorage.getItem(ACTIVE_WEEK_STORAGE_KEY) ?? "");

  function saveWeekId(value: string) {
    setWeekId(value);
    localStorage.setItem(ACTIVE_WEEK_STORAGE_KEY, value);
  }

  if (isLoading) {
    return (
      <div className="page page--treino">
        <h1>Treino</h1>
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    );
  }
  if (isError) return <div className="page-state page-state--error">{(error as Error).message}</div>;
  if (!split) {
    return <Navigate to="/plano" replace state={{ reason: "no-active-split" }} />;
  }

  return (
    <div className="page page--treino">
      <h1>{split.name}</h1>

      <section className="card">
        <h2>Semana de progressão ativa</h2>
        <p className="field-hint">
          Cole aqui o ID da semana do ciclo de progressão em que você está treinando, para poder
          registrar séries. Fica salvo neste dispositivo.
        </p>
        <input
          className="text-input"
          type="text"
          placeholder="ID da semana (weekId)"
          value={weekId}
          onChange={(e) => saveWeekId(e.target.value.trim())}
        />
      </section>

      {split.days.map((day) => (
        <section key={day.id} className="card">
          <h2>{WORKOUT_DAY_TYPE_LABELS[day.type] ?? day.type} — {day.label}</h2>
          <table className="exercise-table">
            <thead>
              <tr>
                <th>Exercício</th>
                <th>Séries</th>
                <th>Reps</th>
                <th>Descanso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex) => (
                <ExerciseRow key={ex.id} name={ex.name} sets={ex.sets} repRange={ex.repRange} restTime={ex.restTime} isCardio={ex.isCardio} weekId={weekId} />
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

function ExerciseRow({
  name, sets, repRange, restTime, isCardio, weekId,
}: Readonly<{
  name: string; sets: number; repRange: string; restTime: string; isCardio: boolean; weekId: string;
}>) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <tr>
        <td>{name}{isCardio ? " 🏃" : ""}</td>
        <td>{sets}</td>
        <td>{repRange}</td>
        <td>{restTime}</td>
        <td>
          <button type="button" onClick={() => setFormOpen((open) => !open)}>
            {formOpen ? "Fechar" : "Registrar"}
          </button>
        </td>
      </tr>
      {formOpen && (
        <tr>
          <td colSpan={5}>
            <LogSetForm exerciseName={name} weekId={weekId} onLogged={() => setFormOpen(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

function LogSetForm({
  exerciseName, weekId, onLogged,
}: Readonly<{
  exerciseName: string; weekId: string; onLogged: () => void;
}>) {
  const [loadKg, setLoadKg] = useState("");
  const [repsPerformed, setRepsPerformed] = useState("");
  const [rir, setRir] = useState("");
  const [note, setNote] = useState("");

  const logSet = useMutation({
    mutationFn: () =>
      trainingApi.logSet(weekId, {
        exerciseName,
        loadKg: Number.parseFloat(loadKg),
        repsPerformed: Number.parseInt(repsPerformed, 10),
        rir: rir === "" ? undefined : Number.parseInt(rir, 10),
        note: note === "" ? undefined : note,
      }),
    onSuccess: () => {
      setLoadKg("");
      setRepsPerformed("");
      setRir("");
      setNote("");
      onLogged();
    },
  });

  if (!weekId) {
    return <p className="page-state page-state--error">Configure o ID da semana ativa acima antes de registrar.</p>;
  }

  return (
    <form
      className="log-set-form"
      onSubmit={(e) => {
        e.preventDefault();
        logSet.mutate();
      }}
    >
      <div className="log-set-form__fields">
        <label>
          <span>Carga (kg)</span>
          <input
            className="text-input"
            type="number"
            step="0.5"
            min="0"
            required
            value={loadKg}
            onChange={(e) => setLoadKg(e.target.value)}
          />
        </label>
        <label>
          <span>Reps</span>
          <input
            className="text-input"
            type="number"
            min="0"
            required
            value={repsPerformed}
            onChange={(e) => setRepsPerformed(e.target.value)}
          />
        </label>
        <label>
          <span>RIR</span>
          <input
            className="text-input"
            type="number"
            min="0"
            max="10"
            value={rir}
            onChange={(e) => setRir(e.target.value)}
          />
        </label>
      </div>
      <label>
        <span>Nota</span>
        <input
          className="text-input"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {logSet.isError && (
        <p className="page-state page-state--error">{(logSet.error as Error).message}</p>
      )}
      <button type="submit" disabled={logSet.isPending}>
        {logSet.isPending ? "Registrando..." : "Salvar série"}
      </button>
    </form>
  );
}

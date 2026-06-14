"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmployeeForm } from "@/components/dashboard/EmployeeForm";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import { ImpactGrid } from "@/components/dashboard/ImpactGrid";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { PredictionPanel } from "@/components/dashboard/PredictionPanel";
import { SectorOverview } from "@/components/dashboard/SectorOverview";
import { SupportPanels } from "@/components/dashboard/SupportPanels";
import type { HistoryItem } from "@/components/dashboard/types";
import type { DatasetOverview } from "@/lib/absenteeism-data";
import type { PredictionResult, Setor, Turno } from "@/lib/prediction";

const historyStorageKey = "absenteeism-history";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function statusFromProbability(probability: number): HistoryItem["status"] {
  if (probability >= 0.35) return "Alerta";
  if (probability >= 0.3) return "Atenção";
  return "Ok";
}

export function DashboardClient({ overview }: { overview: DatasetOverview }) {
  const [colaborador, setColaborador] = useState("ID 001");
  const [idade, setIdade] = useState(30);
  const [distancia, setDistancia] = useState(10);
  const [setor, setSetor] = useState<Setor>("Produção");
  const [turno, setTurno] = useState<Turno>("Manhã");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(overview.historicoInicial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedSectorRisk = useMemo(
    () => overview.riscoPorSetor.find((item) => item.setor === setor)?.risco ?? 0,
    [overview.riscoPorSetor, setor],
  );

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(historyStorageKey);

    if (!savedHistory) {
      return;
    }

    try {
      setHistory(JSON.parse(savedHistory) as HistoryItem[]);
    } catch {
      window.localStorage.removeItem(historyStorageKey);
    }
  }, []);

  function updateHistory(nextHistory: HistoryItem[]) {
    setHistory(nextHistory);
    window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idade, distancia, setor, turno }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao calcular risco.");
      }

      const prediction = payload as PredictionResult;
      const probability = Math.round(prediction.probability * 1000) / 10;

      setResult(prediction);
      updateHistory([
        {
          id: crypto.randomUUID(),
          data: formatDate(new Date()),
          colaborador: colaborador.trim() || "Sem ID",
          risco: `${probability.toFixed(1)}% ${prediction.risk === "alto" ? "Alto" : "Baixo"}`,
          status: statusFromProbability(prediction.probability),
          setor,
          turno,
        },
        ...history,
      ].slice(0, 8));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao calcular risco.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] p-7 max-md:p-[18px]">
      <DashboardHeader totalColaboradores={overview.totalColaboradores} />
      <KpiGrid overview={overview} />

      <section
        className="grid grid-cols-[minmax(280px,360px)_minmax(320px,1fr)_minmax(320px,1fr)] items-stretch gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1"
        aria-label="Analise de risco"
      >
        <EmployeeForm
          colaborador={colaborador}
          idade={idade}
          distancia={distancia}
          setor={setor}
          turno={turno}
          loading={loading}
          onColaboradorChange={setColaborador}
          onIdadeChange={setIdade}
          onDistanciaChange={setDistancia}
          onSetorChange={setSetor}
          onTurnoChange={setTurno}
          onSubmit={handleSubmit}
        />
        <PredictionPanel
          result={result}
          error={error}
          selectedSectorRisk={selectedSectorRisk}
          setor={setor}
          turno={turno}
          overview={overview}
        />
        <SectorOverview overview={overview} setor={setor} turno={turno} />
      </section>

      <ImpactGrid overview={overview} />
      <SupportPanels overview={overview} />
      <HistoryTable history={history} onRestoreDatasetHistory={() => updateHistory(overview.historicoInicial)} />
    </main>
  );
}

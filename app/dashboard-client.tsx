"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Factory,
  Gauge,
  Loader2,
  MapPin,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { DatasetOverview, DemoHistoryItem } from "@/lib/absenteeism-data";
import { setores, turnos, type Setor, type Turno } from "@/lib/prediction";

type PredictionResult = {
  prediction: number;
  probability: number;
  risk: "alto" | "baixo";
  features: Record<string, number>;
  factors: string[];
};

type HistoryItem = DemoHistoryItem;

const turnoIcons = {
  Manhã: Sun,
  Tarde: CalendarClock,
  Noite: Moon,
};

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
      const parsed = JSON.parse(savedHistory) as HistoryItem[];
      setHistory(parsed);
    } catch {
      window.localStorage.removeItem(historyStorageKey);
    }
  }, []);

  function updateHistory(nextHistory: HistoryItem[]) {
    setHistory(nextHistory);
    window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
  }

  function restoreDatasetHistory() {
    updateHistory(overview.historicoInicial);
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

      setResult(payload);

      const probability = Math.round(payload.probability * 1000) / 10;
      updateHistory([
        {
          id: crypto.randomUUID(),
          data: formatDate(new Date()),
          colaborador: colaborador.trim() || "Sem ID",
          risco: `${probability.toFixed(1)}% ${payload.risk === "alto" ? "Alto" : "Baixo"}`,
          status: statusFromProbability(payload.probability),
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

  const probability = result ? Math.round(result.probability * 1000) / 10 : null;
  const isHighRisk = result?.risk === "alto";

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">IA Absenteismo Pro</span>
          <h1>Dashboard Preditivo: Gestão de Absenteísmo</h1>
        </div>
        <div className="top-metric" aria-label="Funcionarios na base sintetica">
          <Users size={18} />
          <span>{overview.totalColaboradores} colaboradores</span>
        </div>
      </header>

      <section className="kpi-grid" aria-label="Resumo da base historica">
        <div>
          <span>Faltas registradas</span>
          <strong>{overview.totalFaltas}</strong>
        </div>
        <div>
          <span>Taxa histórica</span>
          <strong>{overview.taxaAbsenteismo.toFixed(1)}%</strong>
        </div>
        <div>
          <span>Distância média</span>
          <strong>{overview.distanciaMedia.toFixed(1)} km</strong>
        </div>
        <div>
          <span>Turno mais crítico</span>
          <strong>{overview.riscoPorTurno[0]?.turno ?? "--"}</strong>
        </div>
      </section>

      <section className="workspace" aria-label="Analise de risco">
        <aside className="panel sidebar">
          <div className="panel-title">
            <Factory size={20} />
            <h2>Dados do Colaborador</h2>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <label className="field">
              <span>Colaborador</span>
              <input
                className="text-input"
                type="text"
                value={colaborador}
                onChange={(event) => setColaborador(event.target.value)}
                maxLength={24}
              />
            </label>

            <label className="field">
              <span>Idade</span>
              <div className="range-row">
                <input
                  type="range"
                  min="18"
                  max="70"
                  value={idade}
                  onChange={(event) => setIdade(Number(event.target.value))}
                />
                <strong>{idade}</strong>
              </div>
            </label>

            <label className="field">
              <span>Distância Casa-Trabalho</span>
              <div className="input-with-unit">
                <MapPin size={18} />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={distancia}
                  onChange={(event) => setDistancia(Number(event.target.value))}
                />
                <span>km</span>
              </div>
            </label>

            <label className="field">
              <span>Setor</span>
              <select value={setor} onChange={(event) => setSetor(event.target.value as Setor)}>
                {setores.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div className="field">
              <span>Turno</span>
              <div className="segmented" role="radiogroup" aria-label="Turno">
                {turnos.map((item) => {
                  const Icon = turnoIcons[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      className={turno === item ? "active" : ""}
                      onClick={() => setTurno(item)}
                      aria-pressed={turno === item}
                      title={item}
                    >
                      <Icon size={16} />
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? <Loader2 className="spin" size={18} /> : <Gauge size={18} />}
              <span>{loading ? "Calculando" : "Calcular risco"}</span>
            </button>
          </form>
        </aside>

        <section className="panel analysis-panel">
          <div className="panel-title">
            <Activity size={20} />
            <h2>Análise Preditiva</h2>
          </div>

          <div className={`result-band ${isHighRisk ? "risk-high" : "risk-low"}`}>
            <div className="result-icon">
              {isHighRisk ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
            </div>
            <div>
              <span>Resultado</span>
              <strong>
                {result
                  ? isHighRisk
                    ? "Alto risco identificado"
                    : "Baixo risco identificado"
                  : "Aguardando análise"}
              </strong>
            </div>
          </div>

          <div className="probability-block">
            <div>
              <span>Probabilidade de falta</span>
              <strong>{probability === null ? "--" : `${probability.toFixed(1)}%`}</strong>
            </div>
            <div
              className="progress-track"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={probability ?? 0}
            >
              <div style={{ width: `${probability ?? 0}%` }} />
            </div>
          </div>

          {error ? <p className="error-message">{error}</p> : null}

          <div className="insight-grid">
            <div>
              <span>Setor selecionado</span>
              <strong>{setor}</strong>
            </div>
            <div>
              <span>Turno</span>
              <strong>{turno}</strong>
            </div>
            <div>
              <span>Taxa histórica setorial</span>
              <strong>{selectedSectorRisk.toFixed(1)}%</strong>
            </div>
          </div>
        </section>

        <section className="panel chart-panel">
          <div className="panel-title">
            <BarChart3 size={20} />
            <h2>Visão Geral do Setor</h2>
          </div>

          <div className="bar-chart" aria-label="Risco medio por setor">
            {overview.riscoPorSetor.map((item) => (
              <div key={item.setor} className={item.setor === setor ? "selected" : ""}>
                <span>{item.setor}</span>
                <div className="bar-track">
                  <div style={{ width: `${Math.min(item.risco * 3, 100)}%` }} />
                </div>
                <strong>{item.risco.toFixed(1)}%</strong>
              </div>
            ))}
          </div>

          <p className="tip">
            A base histórica aponta {overview.riscoPorTurno[0]?.turno.toLowerCase() ?? "turnos"} como
            recorte de maior atenção operacional.
          </p>
        </section>
      </section>

      <section className="history-section" aria-label="Ultimas analises">
        <div className="section-heading">
          <h2>Últimas Análises e Registros da Base</h2>
          <button className="clear-action" type="button" onClick={restoreDatasetHistory}>
            Restaurar base
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colaborador</th>
                <th>Risco Calculado</th>
                <th>Setor</th>
                <th>Turno</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.data}</td>
                  <td>{item.colaborador}</td>
                  <td>{item.risco}</td>
                  <td>{item.setor}</td>
                  <td>{item.turno}</td>
                  <td>
                    <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

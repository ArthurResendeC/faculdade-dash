import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DatasetOverview } from "@/lib/absenteeism-data";
import type { PredictionResult, Setor, Turno } from "@/lib/prediction";

type PredictionPanelProps = {
  result: PredictionResult | null;
  error: string;
  selectedSectorRisk: number;
  setor: Setor;
  turno: Turno;
};

export function PredictionPanel({
  result,
  error,
  selectedSectorRisk,
  setor,
  turno,
  overview,
}: PredictionPanelProps & { overview: DatasetOverview }) {
  const probability = result ? Math.round(result.probability * 1000) / 10 : null;
  const isHighRisk = result?.risk === "alto";
  const factors = result?.factors.length ? result.factors : overview.fatoresCriticos.slice(0, 3);

  return (
    <section className="flex flex-col rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)]">
      <div className="mb-[18px] flex items-center gap-2.5">
        <Activity className="text-[#1769aa]" size={20} />
        <h2 className="text-base font-bold tracking-normal text-[#17202a]">Análise Preditiva</h2>
      </div>

      <div
        className={`grid min-h-28 grid-cols-[54px_1fr] items-center gap-3.5 rounded-lg border p-4 ${
          isHighRisk ? "border-[#efc3c3] bg-[#f8e8e8]" : "border-[#b9dfd1] bg-[#e5f4ef]"
        }`}
      >
        <div
          className={`grid h-[54px] w-[54px] place-items-center rounded-lg bg-white ${
            isHighRisk ? "text-[#b73535]" : "text-[#14845f]"
          }`}
        >
          {isHighRisk ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
        </div>
        <div>
          <span className="mb-1 block text-[0.82rem] font-extrabold text-[#607082]">Resultado</span>
          <strong className="block text-xl font-extrabold tracking-normal text-[#17202a]">
            {result
              ? isHighRisk
                ? "Alto risco identificado"
                : "Baixo risco identificado"
              : "Aguardando análise"}
          </strong>
        </div>
      </div>

      <div className="mt-[18px] border-b border-[#d9e0e8] py-[18px]">
        <div>
          <span className="mb-1 block text-[0.82rem] font-extrabold text-[#607082]">
            Probabilidade de falta
          </span>
          <strong className="text-[2.2rem] font-extrabold tracking-normal text-[#17202a]">
            {probability === null ? "--" : `${probability.toFixed(1)}%`}
          </strong>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-[#dce5ee]"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={probability ?? 0}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#14845f] via-[#a76812] to-[#b73535] transition-[width] duration-200"
            style={{ width: `${probability ?? 0}%` }}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3.5 rounded-lg border border-[#efc3c3] bg-[#f8e8e8] px-3 py-2.5 font-bold text-[#b73535]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 border-b border-[#d9e0e8] py-4">
        <span className="text-[0.82rem] font-extrabold text-[#607082]">Fatores críticos</span>
        {factors.map((factor) => (
          <div key={factor} className="grid grid-cols-[18px_1fr] items-start gap-2">
            <CheckCircle2 className="mt-0.5 text-[#1769aa]" size={15} />
            <p className="text-sm leading-snug text-[#607082]">{factor}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2.5 pt-[18px] max-md:grid-cols-1">
        <Insight label="Setor selecionado" value={setor} />
        <Insight label="Turno" value={turno} />
        <Insight label="Taxa histórica setorial" value={`${selectedSectorRisk.toFixed(1)}%`} />
      </div>
    </section>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[82px] rounded-lg border border-[#d9e0e8] bg-[#f8fafc] p-3">
      <span className="mb-1 block text-[0.82rem] font-extrabold text-[#607082]">{label}</span>
      <strong className="text-base font-extrabold text-[#17202a]">{value}</strong>
    </div>
  );
}

import { BarChart3 } from "lucide-react";
import type { DatasetOverview } from "@/lib/absenteeism-data";
import type { Setor, Turno } from "@/lib/prediction";

type SectorOverviewProps = {
  overview: DatasetOverview;
  setor: Setor;
  turno: Turno;
};

export function SectorOverview({ overview, setor, turno }: SectorOverviewProps) {
  return (
    <section className="flex flex-col rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)]">
      <div className="mb-[18px] flex items-center gap-2.5">
        <BarChart3 className="text-[#1769aa]" size={20} />
        <h2 className="text-base font-bold tracking-normal text-[#17202a]">Visão Geral do Setor</h2>
      </div>

      <div className="grid gap-3.5" aria-label="Risco medio por setor">
        {overview.riscoPorSetor.map((item) => (
          <div
            key={item.setor}
            className={`grid min-h-[34px] grid-cols-[112px_minmax(80px,1fr)_48px] items-center gap-3 text-sm font-extrabold max-md:grid-cols-[96px_minmax(70px,1fr)_44px] ${
              item.setor === setor ? "text-[#0f4f84]" : "text-[#607082]"
            }`}
          >
            <span>{item.setor}</span>
            <div className="h-[18px] overflow-hidden rounded-full bg-[#dce5ee]">
              <div
                className={`h-full rounded-full ${
                  item.setor === setor ? "bg-[#1769aa]" : "bg-[#a8b7c7]"
                }`}
                style={{ width: `${Math.min(item.risco * 3, 100)}%` }}
              />
            </div>
            <strong>{item.risco.toFixed(1)}%</strong>
          </div>
        ))}
      </div>

      <p className="mt-auto rounded-lg border border-[#c8d9ea] bg-[#ecf5fd] p-3.5 font-bold leading-normal text-[#0f4f84]">
        A base histórica aponta {overview.riscoPorTurno[0]?.turno.toLowerCase() ?? "turnos"} como
        recorte de maior atenção operacional. O filtro atual cruza {setor} com turno da{" "}
        {turno.toLowerCase()}.
      </p>
    </section>
  );
}

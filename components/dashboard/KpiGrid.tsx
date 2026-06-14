import type { DatasetOverview } from "@/lib/absenteeism-data";

type KpiGridProps = {
  overview: DatasetOverview;
};

export function KpiGrid({ overview }: KpiGridProps) {
  const items = [
    { label: "Faltas registradas", value: overview.totalFaltas },
    { label: "Taxa histórica", value: `${overview.taxaAbsenteismo.toFixed(1)}%` },
    { label: "Distância média", value: `${overview.distanciaMedia.toFixed(1)} km` },
    { label: "Turno mais crítico", value: overview.riscoPorTurno[0]?.turno ?? "--" },
    { label: "Faixa de alerta", value: overview.altoRiscoEstimado },
    { label: "Reserva técnica", value: `${overview.reservaTecnicaDiaria}/dia` },
  ];

  return (
    <section
      className="mb-[18px] grid grid-cols-6 gap-3.5 max-lg:grid-cols-3 max-md:grid-cols-1"
      aria-label="Resumo da base historica"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="min-h-[104px] rounded-lg border border-[#d9e0e8] bg-white p-[18px] shadow-[0_18px_50px_rgba(17,34,51,0.08)]"
        >
          <span className="mb-2.5 block text-[0.82rem] font-extrabold text-[#607082]">
            {item.label}
          </span>
          <strong className="block text-[1.58rem] font-extrabold leading-none tracking-normal text-[#17202a]">
            {item.value}
          </strong>
        </div>
      ))}
    </section>
  );
}

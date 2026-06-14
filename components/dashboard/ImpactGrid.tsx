import { TrendingDown, Users, Wallet } from "lucide-react";
import type { DatasetOverview } from "@/lib/absenteeism-data";

type ImpactGridProps = {
  overview: DatasetOverview;
};

export function ImpactGrid({ overview }: ImpactGridProps) {
  const items = [
    {
      icon: TrendingDown,
      label: "Capacidade produtiva em risco",
      value: `até ${overview.capacidadeProdutivaEmRisco}%`,
      description: "Referência usada para demonstrar paradas, gargalos e ociosidade em linha.",
    },
    {
      icon: Wallet,
      label: "Exposição financeira anual",
      value: `${overview.impactoFolhaMin}% a ${overview.impactoFolhaMax}%`,
      description: "Faixa estimada sobre folha, horas extras emergenciais e reposições temporárias.",
    },
    {
      icon: Users,
      label: "Dimensionamento preventivo",
      value: `${overview.reservaTecnicaDiaria} pessoas/dia`,
      description: "Reserva técnica sugerida a partir dos registros mensais de ausência da base.",
    },
  ];

  return (
    <section
      className="mt-[22px] grid grid-cols-3 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1"
      aria-label="Impacto operacional estimado"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="grid gap-2.5 rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)]"
          >
            <div className="grid h-[38px] w-[38px] place-items-center rounded-lg bg-[#e7f0f8] text-[#0f4f84]">
              <Icon size={20} />
            </div>
            <span className="text-[0.82rem] font-extrabold text-[#607082]">{item.label}</span>
            <strong className="text-[1.65rem] font-extrabold leading-none text-[#17202a]">
              {item.value}
            </strong>
            <p className="text-sm leading-normal text-[#607082]">{item.description}</p>
          </div>
        );
      })}
    </section>
  );
}

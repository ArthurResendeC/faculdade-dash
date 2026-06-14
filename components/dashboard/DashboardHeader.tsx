import { Users } from "lucide-react";

type DashboardHeaderProps = {
  totalColaboradores: number;
};

export function DashboardHeader({ totalColaboradores }: DashboardHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-6 max-md:grid max-md:grid-cols-1">
      <div>
        <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-normal text-[#1769aa]">
          IA Absenteismo Pro
        </span>
        <h1 className="max-w-5xl text-[clamp(2rem,4vw,3.8rem)] font-extrabold leading-[1.02] tracking-normal text-[#17202a]">
          Dashboard Preditivo: Gestão de Absenteísmo
        </h1>
      </div>
      <div
        className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-[#d9e0e8] bg-white px-3.5 font-bold text-[#607082] max-md:justify-center"
        aria-label="Funcionarios na base sintetica"
      >
        <Users size={18} />
        <span>{totalColaboradores} colaboradores</span>
      </div>
    </header>
  );
}

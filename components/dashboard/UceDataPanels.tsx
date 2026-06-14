import { BriefcaseBusiness, CalendarDays, Clock3, FileClock } from "lucide-react";
import type { UceOverview, UceRankItem } from "@/lib/absenteeism-data";

type UceDataPanelsProps = {
  uce: UceOverview;
};

export function UceDataPanels({ uce }: UceDataPanelsProps) {
  return (
    <section className="mt-[22px]" aria-label="Dados UCE agregados das planilhas">
      <div className="mb-3 flex items-center justify-between gap-3.5">
        <h2 className="text-[1.08rem] font-bold text-[#17202a]">Dados UCE Reais Agregados</h2>
        <span className="text-sm font-bold text-[#607082]">Resumo anonimizado das planilhas</span>
      </div>

      <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1">
        <MetricCard
          icon={BriefcaseBusiness}
          label="Ativos no cadastro"
          value={uce.workforce.activeEmployees.toLocaleString("pt-BR")}
        />
        <MetricCard
          icon={Clock3}
          label="Colaboradores com jornada"
          value={uce.workforce.scheduledEmployees.toLocaleString("pt-BR")}
        />
        <MetricCard
          icon={FileClock}
          label="Registros de ponto"
          value={uce.pointHistory.records.toLocaleString("pt-BR")}
        />
        <MetricCard
          icon={CalendarDays}
          label="Horas extras históricas"
          value={uce.pointHistory.overtimeHours.toLocaleString("pt-BR")}
        />
      </div>

      <div className="mt-[18px] grid grid-cols-3 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1">
        <RankPanel title="Modo de ponto" items={uce.workforce.pointMode} />
        <RankPanel title="Faixa etária" items={uce.workforce.ageRange} />
        <RankPanel title="Centros de custo" items={uce.workforce.topCostCenters} />
        <RankPanel title="Horários contratuais" items={uce.workforce.topSchedules} />
        <RankPanel title="Funções mais frequentes" items={uce.workforce.topFunctions} />
        <RankPanel title="Meses com mais faltas" items={uce.pointHistory.monthlyAbsences} />
      </div>

      <div className="mt-[18px] grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1">
        <SmallStat label="Faltas registradas" value={uce.pointHistory.absences} />
        <SmallStat label="Atestados" value={uce.pointHistory.medicalCertificates} />
        <SmallStat label="Férias" value={uce.pointHistory.vacations} />
        <SmallStat label="Taxa de falta" value={`${uce.pointHistory.absenceRate.toFixed(1)}%`} />
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)]">
      <div className="mb-3 grid h-[38px] w-[38px] place-items-center rounded-lg bg-[#e7f0f8] text-[#0f4f84]">
        <Icon size={20} />
      </div>
      <span className="mb-2 block text-[0.82rem] font-extrabold text-[#607082]">{label}</span>
      <strong className="text-[1.65rem] font-extrabold leading-none text-[#17202a]">{value}</strong>
    </div>
  );
}

function RankPanel({ title, items }: { title: string; items: UceRankItem[] }) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <div className="rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)]">
      <h3 className="mb-4 text-base font-bold text-[#17202a]">{title}</h3>
      <div className="grid gap-3">
        {items.slice(0, 6).map((item) => (
          <div key={item.label} className="grid gap-1">
            <div className="flex items-center justify-between gap-3 text-sm font-extrabold">
              <span className="truncate text-[#607082]">{item.label}</span>
              <strong className="text-[#17202a]">{item.total.toLocaleString("pt-BR")}</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#dce5ee]">
              <div
                className="h-full rounded-full bg-[#1769aa]"
                style={{ width: `${Math.max((item.total / max) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[#d9e0e8] bg-[#f8fafc] p-4">
      <span className="mb-1 block text-[0.82rem] font-extrabold text-[#607082]">{label}</span>
      <strong className="text-xl font-extrabold text-[#17202a]">
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </strong>
    </div>
  );
}

import {
  AlertTriangle,
  ClipboardCheck,
  Database,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { DatasetOverview } from "@/lib/absenteeism-data";

type SupportPanelsProps = {
  overview: DatasetOverview;
};

const crispStages = ["Negócio", "Dados", "Preparação", "Modelagem", "Avaliação", "Implantação"];

const integrationItems = [
  "Ponto eletrônico",
  "ERP de RH",
  "Atestados médicos",
  "Calendário de produção",
  "Afastamentos",
  "Logs de linha",
];

export function SupportPanels({ overview }: SupportPanelsProps) {
  return (
    <section
      className="mt-[22px] grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-md:grid-cols-1"
      aria-label="Contexto estrategico da solucao"
    >
      <Panel title="Diagnóstico Operacional" icon={Target}>
        <div className="grid gap-3">
          {overview.fatoresCriticos.map((factor) => (
            <div key={factor} className="grid grid-cols-[18px_1fr] items-start gap-2">
              <AlertTriangle className="mt-0.5 text-[#1769aa]" size={16} />
              <p className="text-sm leading-normal text-[#607082]">{factor}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="CRISP-DM" icon={ClipboardCheck}>
        <div className="grid gap-2">
          {crispStages.map((stage, index) => (
            <div key={stage} className="grid grid-cols-[30px_1fr] items-center gap-2">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-[#d9e0e8] bg-[#f8fafc] text-[0.82rem] font-black text-[#0f4f84]">
                {index + 1}
              </span>
              <p className="font-extrabold text-[#17202a]">{stage}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Integrações Futuras" icon={Database}>
        <div className="flex flex-wrap gap-2">
          {integrationItems.map((item) => (
            <span
              key={item}
              className="inline-flex min-h-[30px] items-center rounded-full border border-[#d9e0e8] bg-[#f8fafc] px-2.5 text-[0.84rem] font-extrabold text-[#607082]"
            >
              {item}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="LGPD e SaaS" icon={ShieldCheck} subtle>
        <div className="grid gap-3">
          <ComplianceItem
            icon={LockKeyhole}
            text="IDs anonimizados e análise agregada, sem CPF, nome ou dado médico sensível."
          />
          <ComplianceItem
            icon={Database}
            text="Sem banco no protótipo: CSV versionado e histórico local no navegador."
          />
          <ComplianceItem
            icon={Gauge}
            text="Compatível com deploy serverless na Vercel usando apenas TypeScript."
          />
        </div>
      </Panel>
    </section>
  );
}

type PanelProps = {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  subtle?: boolean;
  children: ReactNode;
};

function Panel({ title, icon: Icon, subtle, children }: PanelProps) {
  return (
    <div
      className={`min-h-[228px] rounded-lg border border-[#d9e0e8] p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)] ${
        subtle ? "bg-[#fbfcfd]" : "bg-white"
      }`}
    >
      <div className="mb-[18px] flex items-center gap-2.5">
        <Icon className="text-[#1769aa]" size={20} />
        <h2 className="text-base font-bold tracking-normal text-[#17202a]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ComplianceItem({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[18px_1fr] items-start gap-2">
      <Icon className="mt-0.5 text-[#1769aa]" size={16} />
      <p className="text-sm leading-normal text-[#607082]">{text}</p>
    </div>
  );
}

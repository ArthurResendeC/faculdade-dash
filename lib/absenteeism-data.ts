import { readFile } from "node:fs/promises";
import path from "node:path";
import uceOverviewJson from "@/data/uce-overview.json";
import { isSetor, isTurno, predictAbsenteeism, type Setor, type Turno } from "./prediction";

export type EmployeeRecord = {
  id: string;
  idade: number;
  setor: Setor;
  turno: Turno;
  distancia: number;
  faltou: boolean;
};

export type SectorSummary = {
  setor: Setor;
  total: number;
  faltas: number;
  risco: number;
};

export type TurnoSummary = {
  turno: Turno;
  total: number;
  faltas: number;
  risco: number;
};

export type DemoHistoryItem = {
  id: string;
  data: string;
  colaborador: string;
  risco: string;
  status: "Alerta" | "Ok" | "Atenção";
  setor: Setor;
  turno: Turno;
};

export type DatasetOverview = {
  totalColaboradores: number;
  totalFaltas: number;
  altoRiscoEstimado: number;
  reservaTecnicaDiaria: number;
  capacidadeProdutivaEmRisco: number;
  impactoFolhaMin: number;
  impactoFolhaMax: number;
  taxaAbsenteismo: number;
  distanciaMedia: number;
  riscoPorSetor: SectorSummary[];
  riscoPorTurno: TurnoSummary[];
  fatoresCriticos: string[];
  uce: UceOverview;
  historicoInicial: DemoHistoryItem[];
};

export type UceRankItem = {
  label: string;
  total: number;
};

export type UceOverview = {
  generatedAt: string;
  workforce: {
    activeEmployees: number;
    scheduledEmployees: number;
    employeesWithPointHistory: number;
    gender: UceRankItem[];
    ageRange: UceRankItem[];
    pointMode: UceRankItem[];
    tenureRange: UceRankItem[];
    topCostCenters: UceRankItem[];
    topFunctions: UceRankItem[];
    topSchedules: UceRankItem[];
  };
  pointHistory: {
    records: number;
    absences: number;
    medicalCertificates: number;
    vacations: number;
    leaves: number;
    overtimeHours: number;
    absenceRate: number;
    certificateRate: number;
    monthlyAbsences: UceRankItem[];
  };
};

const csvPath = path.join(process.cwd(), "dados_absenteismo.csv");

function statusFromProbability(probability: number): DemoHistoryItem["status"] {
  if (probability >= 0.35) return "Alerta";
  if (probability >= 0.3) return "Atenção";
  return "Ok";
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function parseCsvLine(line: string) {
  const [id, idade, setor, turno, distancia, faltou] = line.split(",");

  if (!isSetor(setor) || !isTurno(turno)) {
    return null;
  }

  return {
    id,
    idade: Number(idade),
    setor,
    turno,
    distancia: Number(distancia),
    faltou: faltou === "1",
  } satisfies EmployeeRecord;
}

function summarizeBySector(records: EmployeeRecord[]) {
  const grouped = new Map<Setor, { total: number; faltas: number }>();

  for (const record of records) {
    const current = grouped.get(record.setor) ?? { total: 0, faltas: 0 };
    current.total += 1;
    current.faltas += record.faltou ? 1 : 0;
    grouped.set(record.setor, current);
  }

  return [...grouped.entries()]
    .map(([setor, item]) => ({
      setor,
      total: item.total,
      faltas: item.faltas,
      risco: percent(item.faltas, item.total),
    }))
    .sort((a, b) => b.risco - a.risco);
}

function summarizeByTurno(records: EmployeeRecord[]) {
  const grouped = new Map<Turno, { total: number; faltas: number }>();

  for (const record of records) {
    const current = grouped.get(record.turno) ?? { total: 0, faltas: 0 };
    current.total += 1;
    current.faltas += record.faltou ? 1 : 0;
    grouped.set(record.turno, current);
  }

  return [...grouped.entries()]
    .map(([turno, item]) => ({
      turno,
      total: item.total,
      faltas: item.faltas,
      risco: percent(item.faltas, item.total),
    }))
    .sort((a, b) => b.risco - a.risco);
}

function buildInitialHistory(records: EmployeeRecord[]) {
  return records
    .slice(-8)
    .reverse()
    .map((record, index) => {
      const result = predictAbsenteeism({
        idade: record.idade,
        distancia: record.distancia,
        setor: record.setor,
        turno: record.turno,
      });
      const probability = Math.round(result.probability * 1000) / 10;

      return {
        id: `csv-${record.id}`,
        data: `Base ${String(index + 1).padStart(2, "0")}`,
        colaborador: `ID ${record.id}`,
        risco: `${probability.toFixed(1)}% ${result.risk === "alto" ? "Alto" : "Baixo"}`,
        status: record.faltou ? "Alerta" : statusFromProbability(result.probability),
        setor: record.setor,
        turno: record.turno,
      };
    });
}

export async function getDatasetOverview(): Promise<DatasetOverview> {
  const csv = await readFile(csvPath, "utf-8");
  const records = csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map(parseCsvLine)
    .filter((record): record is EmployeeRecord => Boolean(record));

  const totalFaltas = records.filter((record) => record.faltou).length;
  const altoRiscoEstimado = records.filter((record) =>
    predictAbsenteeism({
      idade: record.idade,
      distancia: record.distancia,
      setor: record.setor,
      turno: record.turno,
    }).prediction === 1,
  ).length;
  const distanciaMedia =
    records.reduce((sum, record) => sum + record.distancia, 0) / Math.max(records.length, 1);
  const riscoPorSetor = summarizeBySector(records);
  const riscoPorTurno = summarizeByTurno(records);

  return {
    totalColaboradores: records.length,
    totalFaltas,
    altoRiscoEstimado,
    reservaTecnicaDiaria: Math.max(1, Math.ceil(totalFaltas / 22)),
    capacidadeProdutivaEmRisco: 30,
    impactoFolhaMin: 2,
    impactoFolhaMax: 7,
    taxaAbsenteismo: percent(totalFaltas, records.length),
    distanciaMedia: Math.round(distanciaMedia * 10) / 10,
    riscoPorSetor,
    riscoPorTurno,
    fatoresCriticos: [
      `${riscoPorSetor[0]?.setor ?? "Setor crítico"} concentra a maior taxa histórica por setor`,
      `${riscoPorTurno[0]?.turno ?? "Turno crítico"} apresenta a maior taxa histórica por turno`,
      `${altoRiscoEstimado} colaboradores simulados entram na faixa de alerta preditivo`,
      `${Math.round(records.filter((record) => record.distancia > 20).length / Math.max(records.length, 1) * 1000) / 10}% da base mora acima de 20 km da unidade`,
    ],
    uce: uceOverviewJson as UceOverview,
    historicoInicial: buildInitialHistory(records),
  };
}

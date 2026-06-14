import { readFile } from "node:fs/promises";
import path from "node:path";
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
  taxaAbsenteismo: number;
  distanciaMedia: number;
  riscoPorSetor: SectorSummary[];
  riscoPorTurno: TurnoSummary[];
  historicoInicial: DemoHistoryItem[];
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
  const distanciaMedia =
    records.reduce((sum, record) => sum + record.distancia, 0) / Math.max(records.length, 1);

  return {
    totalColaboradores: records.length,
    totalFaltas,
    taxaAbsenteismo: percent(totalFaltas, records.length),
    distanciaMedia: Math.round(distanciaMedia * 10) / 10,
    riscoPorSetor: summarizeBySector(records),
    riscoPorTurno: summarizeByTurno(records),
    historicoInicial: buildInitialHistory(records),
  };
}

export const setores = ["Produção", "Embalagem", "Manutenção", "Logística", "Qualidade"] as const;
export const turnos = ["Manhã", "Tarde", "Noite"] as const;

export type Setor = (typeof setores)[number];
export type Turno = (typeof turnos)[number];

export type PredictionInput = {
  idade: number;
  distancia: number;
  setor: Setor;
  turno: Turno;
};

export type PredictionResult = {
  prediction: number;
  probability: number;
  risk: "alto" | "baixo";
  features: Record<string, number>;
  factors: string[];
};

const sectorAdjustments: Record<Setor, number> = {
  Produção: 0.03,
  Embalagem: -0.02,
  Manutenção: 0.05,
  Logística: 0.01,
  Qualidade: -0.04,
};

const trainingColumns = [
  "Idade",
  "Distancia_Casa_Trabalho_km",
  "Setor_Embalagem",
  "Setor_Logística",
  "Setor_Manutenção",
  "Setor_Produção",
  "Setor_Qualidade",
  "Turno_Manhã",
  "Turno_Noite",
  "Turno_Tarde",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isSetor(value: unknown): value is Setor {
  return typeof value === "string" && setores.includes(value as Setor);
}

export function isTurno(value: unknown): value is Turno {
  return typeof value === "string" && turnos.includes(value as Turno);
}

export function buildFeatures(input: PredictionInput) {
  const values: Record<string, number> = {
    Idade: input.idade,
    Distancia_Casa_Trabalho_km: input.distancia,
    [`Setor_${input.setor}`]: 1,
    [`Turno_${input.turno}`]: 1,
  };

  return Object.fromEntries(trainingColumns.map((column) => [column, values[column] ?? 0]));
}

export function predictAbsenteeism(input: PredictionInput): PredictionResult {
  const factors: string[] = [];
  let probability = 0.05;

  if (input.distancia > 20) {
    probability += 0.2;
    factors.push("distância acima de 20 km");
  } else if (input.distancia > 12) {
    probability += 0.08;
    factors.push("distância intermediária");
  }

  if (input.turno === "Noite") {
    probability += 0.15;
    factors.push("turno noturno");
  } else if (input.turno === "Tarde") {
    probability += 0.03;
  }

  if (input.idade < 24) {
    probability += 0.03;
  } else if (input.idade > 55) {
    probability += 0.02;
  }

  const sectorAdjustment = sectorAdjustments[input.setor];
  probability += sectorAdjustment;

  if (sectorAdjustment > 0.025) {
    factors.push(`setor com risco operacional maior: ${input.setor}`);
  }

  const normalizedProbability = clamp(probability, 0.01, 0.92);
  const prediction = normalizedProbability >= 0.35 ? 1 : 0;

  return {
    prediction,
    probability: normalizedProbability,
    risk: prediction === 1 ? "alto" : "baixo",
    features: buildFeatures(input),
    factors,
  };
}

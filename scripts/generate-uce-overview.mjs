import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const root = process.cwd();
const sheetsDir = path.join(root, "planilhas");

function normalize(value) {
  return String(value ?? "").trim();
}

function counterToTop(counter, limit = 8) {
  return [...counter.entries()]
    .filter(([label]) => label)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, total]) => ({ label, total }));
}

function increment(counter, key, amount = 1) {
  const normalized = normalize(key) || "Não informado";
  counter.set(normalized, (counter.get(normalized) ?? 0) + amount);
}

function parseDelimitedCsv(content) {
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(";").map((item) => item.trim());

  return lines.map((line) => {
    const values = line.split(";");
    return Object.fromEntries(headers.map((header, index) => [header, normalize(values[index])]));
  });
}

function parseTimeToMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(normalize(value));
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function readWorksheet(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheet = workbook.Sheets[sheetName ?? workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

const activeCsv = await readFile(path.join(sheetsDir, "Base Ativos UCE.csv"));
const activeRows = parseDelimitedCsv(activeCsv.toString("latin1"));
const scheduleRows = readWorksheet(path.join(sheetsDir, "Horário de trabalho contratual.xlsx"));
const pointRows = readWorksheet(
  path.join(sheetsDir, "Planilha_Historico_Ponto_UCE.xlsx"),
  "Historico_Ponto_3_Anos",
);

const gender = new Map();
const ageRange = new Map();
const pointMode = new Map();
const costCenter = new Map();
const functionName = new Map();
const tenureRange = new Map();

for (const row of activeRows) {
  increment(gender, row.GENERO);
  increment(ageRange, row.FAIXAETARIA);
  increment(pointMode, row["Modo Ponto"]);
  increment(costCenter, row["Centro de Custo - Nome"]);
  increment(functionName, row["Função - Nome"]);
  increment(tenureRange, row.FAIXATEMPODECASA);
}

const scheduleCounter = new Map();
for (const row of scheduleRows) {
  increment(scheduleCounter, row["Horário Contratual"]);
}

let faltas = 0;
let atestados = 0;
let ferias = 0;
let afastamentos = 0;
let extraMinutes = 0;
const employeesWithPoint = new Set();
const monthlyAbsences = new Map();

for (const row of pointRows) {
  employeesWithPoint.add(normalize(row["Id Global"]));

  if (normalize(row.Falta) === "Sim") {
    faltas += 1;
    increment(monthlyAbsences, normalize(row.Data).slice(0, 7));
  }

  if (normalize(row.Atestado) === "Sim") atestados += 1;
  if (normalize(row.Férias) === "Sim") ferias += 1;
  if (normalize(row.Afastamento) === "Sim") afastamentos += 1;

  extraMinutes += parseTimeToMinutes(row["Horas Extras"]);
}

const overview = {
  generatedAt: new Date().toISOString(),
  workforce: {
    activeEmployees: activeRows.length,
    scheduledEmployees: scheduleRows.length,
    employeesWithPointHistory: employeesWithPoint.size,
    gender: counterToTop(gender),
    ageRange: counterToTop(ageRange),
    pointMode: counterToTop(pointMode),
    tenureRange: counterToTop(tenureRange),
    topCostCenters: counterToTop(costCenter, 6),
    topFunctions: counterToTop(functionName, 6),
    topSchedules: counterToTop(scheduleCounter, 6),
  },
  pointHistory: {
    records: pointRows.length,
    absences: faltas,
    medicalCertificates: atestados,
    vacations: ferias,
    leaves: afastamentos,
    overtimeHours: Math.round((extraMinutes / 60) * 10) / 10,
    absenceRate: Math.round((faltas / Math.max(pointRows.length, 1)) * 1000) / 10,
    certificateRate: Math.round((atestados / Math.max(pointRows.length, 1)) * 1000) / 10,
    monthlyAbsences: counterToTop(monthlyAbsences, 12),
  },
};

await mkdir(path.join(root, "data"), { recursive: true });
await writeFile(path.join(root, "data", "uce-overview.json"), `${JSON.stringify(overview, null, 2)}\n`);

console.log("Generated data/uce-overview.json");

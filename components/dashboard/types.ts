import type { DemoHistoryItem } from "@/lib/absenteeism-data";
import type { PredictionResult } from "@/lib/prediction";

export type HistoryItem = DemoHistoryItem;

export type DashboardPrediction = PredictionResult | null;

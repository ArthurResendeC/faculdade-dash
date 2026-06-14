import { DashboardClient } from "./dashboard-client";
import { getDatasetOverview } from "@/lib/absenteeism-data";

export default async function Home() {
  const overview = await getDatasetOverview();

  return <DashboardClient overview={overview} />;
}

import { calculateEnergyInsights } from "../utils/disciplineUtils";
import type { EnergyLog, PlannerState } from "../types/planner";

export { calculateEnergyInsights };

export function saveEnergyLog(state: PlannerState, log: Omit<EnergyLog, "id">): PlannerState {
  const id = `energy-${log.date}`;
  return { ...state, energyLogs: { ...state.energyLogs, [id]: { ...log, id } } };
}

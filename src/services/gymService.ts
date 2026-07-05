import { calculateGymStreak } from "../utils/disciplineUtils";
import type { GymLog, PlannerState } from "../types/planner";

export { calculateGymStreak };

export const weeklyGymRoutine = [
  { day: "Monday", title: "Strength A", exercises: ["Squat", "Push-up", "Row"] },
  { day: "Wednesday", title: "Mobility + Core", exercises: ["Plank", "Hip mobility", "Stretch"] },
  { day: "Friday", title: "Strength B", exercises: ["Deadlift pattern", "Press", "Carry"] },
  { day: "Sunday", title: "Light Recovery", exercises: ["Walk", "Stretch", "Breathing"] }
];

export function saveGymLog(state: PlannerState, log: Omit<GymLog, "id">): PlannerState {
  const id = `gym-${log.date}`;
  return { ...state, gymLogs: { ...state.gymLogs, [id]: { ...log, id } } };
}

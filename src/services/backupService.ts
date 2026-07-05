import { plannerData } from "../lib/plannerData";
import { createInitialPlannerState } from "../lib/progressStorage";
import type { Account, PlannerState } from "../types/planner";

export type PlannerBackup = {
  app: "Exam Clearance Planner";
  version: 1;
  exportedAt: string;
  user?: Pick<Account, "id" | "email" | "name">;
  plannerFingerprint: {
    examDate: string;
    syllabusCompletionDate: string;
    topicCount: number;
  };
  state: PlannerState;
};

export function createBackup(state: PlannerState, user?: Account | null): PlannerBackup {
  return {
    app: "Exam Clearance Planner",
    version: 1,
    exportedAt: new Date().toISOString(),
    user: user ? { id: user.id, email: user.email, name: user.name } : undefined,
    plannerFingerprint: {
      examDate: plannerData.examDate,
      syllabusCompletionDate: plannerData.syllabusCompletionDate,
      topicCount: plannerData.topics.length
    },
    state
  };
}

export function validateBackup(value: unknown): { ok: true; backup: PlannerBackup } | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "Backup is not a JSON object." };
  const backup = value as Partial<PlannerBackup>;
  if (backup.app !== "Exam Clearance Planner" || backup.version !== 1) return { ok: false, error: "Backup file is not compatible with this planner." };
  if (!backup.state || typeof backup.state !== "object") return { ok: false, error: "Backup is missing planner state." };
  if (backup.plannerFingerprint?.examDate !== plannerData.examDate) return { ok: false, error: "Backup exam date does not match this locked planner." };
  return { ok: true, backup: backup as PlannerBackup };
}

export function restoreBackup(backup: PlannerBackup): PlannerState {
  const base = createInitialPlannerState();
  return {
    ...base,
    ...backup.state,
    rowEdits: { ...base.rowEdits, ...backup.state.rowEdits },
    tasks: { ...base.tasks, ...backup.state.tasks },
    topicProgress: { ...base.topicProgress, ...backup.state.topicProgress }
  };
}

import type { DeepWorkSession, DistractionLog, PlannerState, TimerMode } from "../types/planner";

export function minutesForMode(mode: TimerMode, customMinutes = 45) {
  if (mode === "Pomodoro") return 25;
  if (mode === "Deep Work") return 90;
  return Math.max(5, customMinutes);
}

export function createDeepWorkSession(input: Omit<DeepWorkSession, "id" | "status" | "startedAt" | "completedMinutes" | "distractions">): DeepWorkSession {
  return {
    ...input,
    id: `deep-${Date.now()}`,
    status: "idle",
    completedMinutes: 0,
    distractions: []
  };
}

export function upsertDeepWorkSession(state: PlannerState, session: DeepWorkSession): PlannerState {
  return { ...state, deepWorkSessions: { ...state.deepWorkSessions, [session.id]: session } };
}

export function startDeepWorkSession(state: PlannerState, sessionId: string): PlannerState {
  const session = state.deepWorkSessions[sessionId];
  if (!session) return state;
  return upsertDeepWorkSession(state, { ...session, status: "running", startedAt: session.startedAt ?? new Date().toISOString() });
}

export function pauseDeepWorkSession(state: PlannerState, sessionId: string, pauseReason: string): PlannerState {
  const session = state.deepWorkSessions[sessionId];
  if (!session) return state;
  return upsertDeepWorkSession(state, { ...session, status: "paused", pausedAt: new Date().toISOString(), pauseReason });
}

export function resumeDeepWorkSession(state: PlannerState, sessionId: string): PlannerState {
  const session = state.deepWorkSessions[sessionId];
  if (!session) return state;
  return upsertDeepWorkSession(state, { ...session, status: "running" });
}

export function logDistraction(state: PlannerState, sessionId: string, reason: string): PlannerState {
  const session = state.deepWorkSessions[sessionId];
  if (!session || !reason.trim()) return state;
  const distraction: DistractionLog = { id: `distraction-${Date.now()}`, reason, timestamp: new Date().toISOString() };
  return upsertDeepWorkSession(state, { ...session, distractions: [...session.distractions, distraction] });
}

export function completeDeepWorkSession(state: PlannerState, sessionId: string, completedMinutes: number): PlannerState {
  const session = state.deepWorkSessions[sessionId];
  if (!session) return state;
  const nextSession: DeepWorkSession = { ...session, completedMinutes, status: "completed", completedAt: new Date().toISOString() };
  const tasks = { ...state.tasks };
  if (session.taskId && tasks[session.taskId]) {
    tasks[session.taskId] = { ...tasks[session.taskId], actualMinutes: tasks[session.taskId].actualMinutes + completedMinutes };
  }
  return { ...state, tasks, deepWorkSessions: { ...state.deepWorkSessions, [sessionId]: nextSession } };
}

export function deepWorkMinutesForDate(state: PlannerState, date: string) {
  return Object.values(state.deepWorkSessions).filter((session) => session.date === date && session.status === "completed").reduce((sum, session) => sum + session.completedMinutes, 0);
}

export function distractionCountForDate(state: PlannerState, date: string) {
  return Object.values(state.deepWorkSessions).filter((session) => session.date === date).reduce((sum, session) => sum + session.distractions.length, 0);
}

import type { NotificationPreference, PlannerState, Reminder } from "../types/planner";

export function updateReminder(state: PlannerState, reminderId: string, patch: Partial<Reminder>): PlannerState {
  const reminder = state.reminders[reminderId];
  if (!reminder) return state;
  return { ...state, reminders: { ...state.reminders, [reminderId]: { ...reminder, ...patch } } };
}

export async function requestNotificationPermission(): Promise<NotificationPreference> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { remindersEnabled: false, permission: "unsupported" };
  }
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return { remindersEnabled: permission === "granted", permission };
}

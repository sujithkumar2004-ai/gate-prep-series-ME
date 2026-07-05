import type { Reminder } from "../types/planner";

const reminderStorageKey = "gate-me-planner-reminder-events-v1";

export async function requestReminderPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function saveReminderEvents(reminders: Reminder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(reminderStorageKey, JSON.stringify(reminders.filter((reminder) => reminder.enabled)));
}

export function notifyReminder(reminder: Reminder) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }
  new Notification(reminder.title, { body: `${reminder.type} due at ${reminder.dueAt}` });
  return true;
}

export function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calculateDaysLeft(targetDate: string, fromDate = new Date().toISOString().slice(0, 10)) {
  const target = new Date(`${targetDate}T00:00:00`).getTime();
  const from = new Date(`${fromDate}T00:00:00`).getTime();
  return Math.max(0, Math.ceil((target - from) / 86400000));
}

export function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  return Math.max(0, Math.ceil((end - start) / 86400000));
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

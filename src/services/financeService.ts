import { apiFetch, localFallbackEnabled } from "./api/apiClient";

export async function loadFinance(token?: string) {
  if (!token) return { salary: [], expenses: [], fallbackUsed: true };
  try {
    return { ...(await apiFetch<{ salary: unknown[]; expenses: unknown[] }>("/finance", {}, token)), fallbackUsed: false };
  } catch {
    if (!localFallbackEnabled()) throw new Error("Unable to load finance data");
    return { salary: [], expenses: [], fallbackUsed: true };
  }
}

export async function saveSalary(entry: unknown, token?: string) {
  if (!token) return { fallbackUsed: true };
  return apiFetch("/finance/salary", { method: "POST", body: JSON.stringify(entry) }, token);
}

export async function saveExpense(entry: unknown, token?: string) {
  if (!token) return { fallbackUsed: true };
  return apiFetch("/finance/expense", { method: "POST", body: JSON.stringify(entry) }, token);
}

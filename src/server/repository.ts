import { plannerData } from "../lib/plannerData";
import { createInitialPlannerState } from "../lib/progressStorage";
import { verifyPassword } from "./crypto";
import type { PlannerState } from "../types/planner";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

const defaultUser: UserRecord = {
  id: "local-student",
  name: "Student",
  email: "student@example.com",
  passwordHash: "pbkdf2_sha256$120000$localdevseed0001$fbeb49c221fe9c87cdc15f93096731e1b32fb8b230f23fd1f3894c5a557763af",
  role: "student",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function shouldSeedLocalUser() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_DEFAULT_USER === "true";
}

const userStore = new Map<string, UserRecord>(shouldSeedLocalUser() ? [[defaultUser.email, defaultUser]] : []);
const progressStore = new Map<string, PlannerState>();

export async function findUserByEmail(email: string) {
  return userStore.get(email.toLowerCase()) ?? null;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

export async function getPlannerState(userId: string) {
  if (!progressStore.has(userId)) progressStore.set(userId, createInitialPlannerState());
  return progressStore.get(userId)!;
}

export async function savePlannerState(userId: string, state: PlannerState) {
  progressStore.set(userId, state);
  return state;
}

export function getPlannerSource() {
  return plannerData;
}

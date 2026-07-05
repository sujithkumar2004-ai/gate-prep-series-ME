import { createHash, randomBytes, pbkdf2Sync } from "crypto";
import { plannerData } from "../src/lib/plannerData";
import { validatePlannerData } from "../src/lib/plannerValidation";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

const includeDevUser = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_DEFAULT_USER === "true";
const validation = validatePlannerData(plannerData);

if (!validation.ok) {
  console.error(validation);
  process.exit(1);
}

console.log({
  idempotent: true,
  defaultUser: includeDevUser ? {
    email: "student@example.com",
    passwordHash: hashPassword("Student@123"),
    name: "Student",
    role: "student"
  } : "skipped in production unless ENABLE_DEV_DEFAULT_USER=true",
  seedIncludes: [
    "GATE ME subjects",
    `${plannerData.topics.length} topics`,
    "topic weightage/difficulty/priority defaults",
    "revision cycles",
    "mistake categories",
    "gym routine",
    "salary/expense categories"
  ],
  checksum: createHash("sha256").update("gate-me-seed-v1").digest("hex")
});

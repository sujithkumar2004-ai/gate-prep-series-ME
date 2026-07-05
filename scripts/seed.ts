import { createHash, randomBytes, pbkdf2Sync } from "crypto";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

console.log({
  defaultUser: {
    email: "student@example.com",
    passwordHash: hashPassword("Student@123"),
    name: "Student",
    role: "student"
  },
  seedIncludes: [
    "GATE ME subjects",
    "topics",
    "topic weightage",
    "revision cycles",
    "mistake categories",
    "gym routine",
    "salary/expense categories"
  ],
  checksum: createHash("sha256").update("gate-me-seed-v1").digest("hex")
});

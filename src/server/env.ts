type EnvValidation = {
  ok: boolean;
  errors: string[];
};

const productionRequired = ["DATABASE_URL", "JWT_SECRET", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;

export function validateServerEnv(): EnvValidation {
  const errors: string[] = [];
  if (process.env.NODE_ENV === "production") {
    productionRequired.forEach((key) => {
      if (!process.env[key]) errors.push(`${key} is required in production`);
    });
  }
  if (process.env.NEXT_PUBLIC_EXAM_DATE && process.env.NEXT_PUBLIC_EXAM_DATE !== "2027-02-07") {
    errors.push("NEXT_PUBLIC_EXAM_DATE must stay locked to 2027-02-07");
  }
  if (process.env.NEXT_PUBLIC_SYLLABUS_LOCK_DATE && process.env.NEXT_PUBLIC_SYLLABUS_LOCK_DATE !== "2026-12-31") {
    errors.push("NEXT_PUBLIC_SYLLABUS_LOCK_DATE must stay locked to 2026-12-31");
  }
  return { ok: errors.length === 0, errors };
}

export function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "local_development_only_change_me";
}

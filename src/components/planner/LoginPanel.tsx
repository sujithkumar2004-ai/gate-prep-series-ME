"use client";

import { LockKeyhole, UserRound } from "lucide-react";
import type { FormEvent } from "react";

export function LoginPanel({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: {
  email: string;
  password: string;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="loginShell">
      <section className="loginPanel" aria-label="Login">
        <div className="loginBrand">
          <p className="eyebrow">GATE ME 2027</p>
          <h1>Daily Syllabus Planner</h1>
          <p>Sign in to keep your planner progress separate on this device.</p>
        </div>
        <form className="loginCard" onSubmit={onSubmit}>
          <div className="loginIcon">
            <LockKeyhole size={24} />
          </div>
          <h2>Login</h2>
          <label>
            <span>Email</span>
            <div>
              <UserRound size={18} />
              <input
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div>
              <LockKeyhole size={18} />
              <input
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="Enter password"
                type="password"
                autoComplete="current-password"
              />
            </div>
          </label>
          {error && <p className="loginError">{error}</p>}
          <button type="submit">Sign In</button>
        </form>
      </section>
    </main>
  );
}

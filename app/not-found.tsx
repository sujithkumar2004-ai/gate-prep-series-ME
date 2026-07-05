import Link from "next/link";

export default function NotFound() {
  return (
    <main className="loginShell">
      <section className="loginCard">
        <p className="eyebrow">404</p>
        <h1>That planner page does not exist.</h1>
        <p>Return to the planner dashboard and continue from your saved state.</p>
        <Link className="iconTextButton" href="/">Open planner</Link>
      </section>
    </main>
  );
}

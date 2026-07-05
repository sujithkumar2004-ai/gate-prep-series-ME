"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="loginShell">
          <section className="loginCard">
            <p className="eyebrow">Planner error</p>
            <h1>Something needs a retry.</h1>
            <p>{error.message || "The planner hit an unexpected error."}</p>
            <button className="iconTextButton" onClick={reset}>Retry</button>
          </section>
        </main>
      </body>
    </html>
  );
}

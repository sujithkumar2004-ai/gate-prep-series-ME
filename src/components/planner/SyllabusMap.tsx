"use client";

import type { SyllabusSubject } from "../../types/planner";

export function SyllabusMap({ syllabus }: { syllabus: SyllabusSubject[] }) {
  return (
    <section className="syllabusGrid" aria-label="Syllabus map">
      {syllabus.map((row) => (
        <article className="syllabusCard" key={row.id}>
          <p>{row.section}</p>
          <h3>{row.subject}</h3>
          <ul>
            {row.topics.map((topic) => (
              <li key={topic.id}>{topic.title}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

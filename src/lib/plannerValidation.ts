import type { PlannerData } from "../types/planner";

export type PlannerValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function validatePlannerData(data: PlannerData): PlannerValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const subjects = new Set(data.subjects.map((subject) => subject.id));
  const topics = new Set(data.topics.map((topic) => topic.id));
  const seenTopicNames = new Set<string>();

  data.topics.forEach((topic) => {
    if (!subjects.has(topic.subjectId)) errors.push(`Topic ${topic.id} has missing subject ${topic.subjectId}`);
    if (!topic.weightage || topic.weightage < 1) errors.push(`Topic ${topic.id} is missing a valid weightage`);
    if (!topic.difficulty) errors.push(`Topic ${topic.id} is missing difficulty`);
    if (!topic.priority || topic.priority < 1) errors.push(`Topic ${topic.id} is missing priority`);
    const key = `${topic.subjectId}:${topic.title.toLowerCase()}`;
    if (seenTopicNames.has(key)) errors.push(`Duplicate topic ${topic.title} under ${topic.subjectId}`);
    seenTopicNames.add(key);
  });

  data.days.forEach((day) => {
    if (!subjects.has(day.subjectId)) errors.push(`Planner day ${day.id} has missing subject ${day.subjectId}`);
    if (!topics.has(day.topicId)) errors.push(`Planner day ${day.id} has missing topic ${day.topicId}`);
    if (day.date > data.syllabusCompletionDate && day.date < data.examDate) {
      const text = `${day.dailyTask} ${day.workItems.join(" ")}`.toLowerCase();
      const januaryNewConcept = day.date.startsWith("2027-01") && /learn|concept|new topic/.test(text);
      if (januaryNewConcept) warnings.push(`January day ${day.id} appears to contain a new syllabus task`);
    }
  });

  if (data.examDate !== "2027-02-07") errors.push("Final exam date must be 2027-02-07");
  if (data.syllabusCompletionDate !== "2026-12-31") errors.push("Syllabus lock date must be 2026-12-31");

  return { ok: errors.length === 0, errors, warnings };
}

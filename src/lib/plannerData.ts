import plannerJson from "../data/planner.json";
import type {
  DayKind,
  PlannerData,
  PlannerDay,
  PlannerPhase,
  PlannerWeek,
  RowEdit,
  Status,
  StoredState,
  SyllabusSubject
} from "../types/planner";

type RawDay = {
  Date: string;
  Day: string;
  Phase: string;
  "Main Subject": string;
  Topic: string;
  "Daily Task": string;
  "PYQ Target": string;
  Revision: string;
  "Test/Mock": string;
  "Target Hours": number;
  Status: Status;
  Notes: string | null;
};

type RawSyllabusRow = {
  Section: string;
  Subject: string;
  "Topics Included": string;
};

type RawWeek = {
  Week: number;
  "Start Date": string;
  "End Date": string;
  Phase: string;
  "Main Subjects": string;
  "Target Hours": number;
};

type RawPlanner = {
  "Daywise Plan": RawDay[];
  "Syllabus Map": RawSyllabusRow[];
  "Weekly Tracker": RawWeek[];
};

const rawPlanner = plannerJson as RawPlanner;

export const statuses: Status[] = ["Not Started", "In Progress", "Done", "Backlog"];

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferKind(row: RawDay): DayKind {
  const text = `${row["Daily Task"]} ${row.Topic} ${row["Test/Mock"]}`.toLowerCase();
  if (text.includes("gate exam")) return "Exam";
  if (text.includes("rest")) return "Rest";
  return "Study";
}

function buildWorkItems(row: RawDay) {
  return [
    row["Daily Task"],
    row["PYQ Target"],
    row.Revision,
    row["Test/Mock"]
  ].filter((item) => item && item !== "-");
}

function normalizeDays(): PlannerDay[] {
  return rawPlanner["Daywise Plan"].map((row, index) => ({
    id: `${row.Date}-${index}`,
    date: row.Date,
    day: row.Day,
    phase: row.Phase,
    week: `Week ${Math.floor(index / 7) + 1}`,
    mainSubject: row["Main Subject"],
    topic: row.Topic,
    dailyTask: row["Daily Task"],
    workItems: buildWorkItems(row),
    targetHours: row["Target Hours"],
    status: row.Status,
    notes: row.Notes,
    kind: inferKind(row)
  }));
}

function normalizeSyllabus(): SyllabusSubject[] {
  return rawPlanner["Syllabus Map"].map((row, index) => ({
    id: `${slug(row.Subject)}-${index}`,
    section: row.Section,
    subject: row.Subject,
    topics: row["Topics Included"]
      .split("\n")
      .map((topic) => topic.trim())
      .filter(Boolean)
      .map((topic, topicIndex) => ({ id: `${slug(row.Subject)}-${topicIndex}`, title: topic }))
  }));
}

function normalizeWeeks(): PlannerWeek[] {
  return rawPlanner["Weekly Tracker"].map((row) => ({
    id: `week-${row.Week}`,
    week: row.Week,
    startDate: row["Start Date"],
    endDate: row["End Date"],
    phase: row.Phase,
    mainSubjects: row["Main Subjects"],
    targetHours: row["Target Hours"]
  }));
}

function normalizePhases(weeks: PlannerWeek[]): PlannerPhase[] {
  const phaseTitles = Array.from(new Set(weeks.map((week) => week.phase)));
  return phaseTitles.map((title, index) => {
    const phaseWeeks = weeks.filter((week) => week.phase === title);
    const start = phaseWeeks[0]?.startDate ?? "";
    const end = phaseWeeks[phaseWeeks.length - 1]?.endDate ?? "";
    return {
      id: `phase-${index + 1}`,
      title,
      dates: start && end ? `${formatDate(start)} - ${formatDate(end)}` : "",
      goal: phaseWeeks.map((week) => week.mainSubjects).filter(Boolean).slice(0, 2).join(" | "),
      weeks: phaseWeeks
    };
  });
}

const days = normalizeDays();
const weeks = normalizeWeeks();

export const plannerData: PlannerData = {
  days,
  weeks,
  phases: normalizePhases(weeks),
  syllabus: normalizeSyllabus(),
  planStartDate: days[0]?.date ?? "2026-06-01",
  planEndDate: days[days.length - 1]?.date ?? "2027-02-01",
  syllabusCompletionDate: "2026-12-31"
};

export function rowKey(row: PlannerDay) {
  return row.id;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function createInitialEdits(): StoredState {
  return plannerData.days.reduce<StoredState>((acc, row) => {
    acc[rowKey(row)] = {
      status: row.status,
      notes: row.notes ?? "",
      actualHours: 0
    };
    return acc;
  }, {});
}

export function mergeStoredState(saved: StoredState | null): StoredState {
  return { ...createInitialEdits(), ...(saved ?? {}) };
}

export function computeMetrics(edits: StoredState) {
  const counts = statuses.reduce<Record<Status, number>>((acc, item) => {
    acc[item] = 0;
    return acc;
  }, {} as Record<Status, number>);
  let actualHours = 0;
  let targetHours = 0;
  plannerData.days.forEach((row) => {
    const edit = edits[rowKey(row)];
    counts[edit?.status ?? row.status] += 1;
    actualHours += Number(edit?.actualHours ?? 0);
    targetHours += Number(row.targetHours ?? 0);
  });
  const studyDays = plannerData.days.filter((row) => row.kind === "Study").length;
  const restDays = plannerData.days.filter((row) => row.kind === "Rest").length;
  return {
    total: plannerData.days.length,
    studyDays,
    restDays,
    counts,
    targetHours,
    actualHours,
    completion: Math.round((counts.Done / Math.max(plannerData.days.length, 1)) * 100)
  };
}

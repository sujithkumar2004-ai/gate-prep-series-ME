export type Status = "Not Started" | "In Progress" | "Done" | "Backlog";

export type DayKind = "Study" | "Rest" | "Exam";

export type PlannerDay = {
  id: string;
  date: string;
  day: string;
  phase: string;
  week: string;
  mainSubject: string;
  topic: string;
  dailyTask: string;
  workItems: string[];
  targetHours: number;
  status: Status;
  notes: string | null;
  kind: DayKind;
};

export type SyllabusTopic = {
  id: string;
  title: string;
};

export type SyllabusSubject = {
  id: string;
  section: string;
  subject: string;
  topics: SyllabusTopic[];
};

export type PlannerWeek = {
  id: string;
  week: number;
  startDate: string;
  endDate: string;
  phase: string;
  mainSubjects: string;
  targetHours: number;
};

export type PlannerPhase = {
  id: string;
  title: string;
  dates: string;
  goal: string;
  weeks: PlannerWeek[];
};

export type PlannerData = {
  days: PlannerDay[];
  phases: PlannerPhase[];
  weeks: PlannerWeek[];
  syllabus: SyllabusSubject[];
  planStartDate: string;
  planEndDate: string;
  syllabusCompletionDate: string;
};

export type RowEdit = {
  status: Status;
  notes: string;
  actualHours: number;
};

export type StoredState = Record<string, RowEdit>;

export type Account = {
  username: string;
  password: string;
  name: string;
};

export type BackendStatus = {
  status: "connected";
  framework: string;
  totalDays: number;
  subjectsCovered: string[];
  syllabusCompletionDate: string | null;
  examDate: string | null;
};

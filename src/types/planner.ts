export type Status = "Not Started" | "In Progress" | "Done" | "Backlog";

export type DayKind = "Study" | "Rest" | "Exam";

export type DailyTaskType = "concept" | "notes" | "pyq" | "revision" | "weak_repair" | "backlog";

export type DailyTaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export type TopicMasteryStatus =
  | "Not Started"
  | "Learning"
  | "Notes Done"
  | "PYQ Started"
  | "PYQ Done"
  | "Revision Due"
  | "Revised"
  | "Weak"
  | "Mastered";

export type PlannerMode = "Normal Mode" | "Backlog Mode" | "Crash Mode" | "Mock-Only Mode";

export type Subject = {
  id: string;
  name: string;
  section: string;
};

export type Topic = {
  id: string;
  subjectId: string;
  title: string;
  weightage: number;
  source: "syllabus" | "planner";
};

export type PlannerDay = {
  id: string;
  date: string;
  day: string;
  phase: string;
  week: string;
  subjectId: string;
  topicId: string;
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
  topicId: string;
  weightage: number;
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
  subjects: Subject[];
  topics: Topic[];
  syllabus: SyllabusSubject[];
  planStartDate: string;
  planEndDate: string;
  examDate: string;
  syllabusCompletionDate: string;
};

export type RowEdit = {
  status: Status;
  notes: string;
  actualHours: number;
};

export type StoredState = Record<string, RowEdit>;

export type DailyTask = {
  id: string;
  date: string;
  sourceDayId: string;
  subjectId: string;
  topicId: string;
  type: DailyTaskType;
  title: string;
  plannedMinutes: number;
  actualMinutes: number;
  status: DailyTaskStatus;
  skipReason: string;
  completedAt?: string;
};

export type DailyPlan = {
  date: string;
  tasks: DailyTask[];
};

export type DailyProgress = {
  date: string;
  totalPlannedTasks: number;
  completedTasks: number;
  skippedTasks: number;
  pendingTasks: number;
  plannedMinutes: number;
  actualMinutes: number;
  completionPercentage: number;
  dailyScore: number;
};

export type RevisionItem = {
  id: string;
  sourceTaskId: string;
  subjectId: string;
  topicId: string;
  dueDate: string;
  cycle: "D0" | "D1" | "D3" | "D7" | "D15" | "D30";
  title: string;
  status: "pending" | "completed";
  completedAt?: string;
};

export type BacklogItem = {
  id: string;
  taskId: string;
  date: string;
  subjectId: string;
  topicId: string;
  title: string;
  reason: string;
  recoveryDate: string;
  priority: "Low" | "Medium" | "High";
  status: "active" | "recovered";
  recoveredAt?: string;
};

export type TopicProgress = {
  topicId: string;
  conceptCompleted: boolean;
  notesCompleted: boolean;
  pyqCompleted: boolean;
  revisionsCompleted: number;
  accuracy: number;
  lastRevisedDate?: string;
  nextRevisionDate?: string;
  status: TopicMasteryStatus;
};

export type PlannerState = {
  rowEdits: StoredState;
  tasks: Record<string, DailyTask>;
  revisions: Record<string, RevisionItem>;
  backlog: Record<string, BacklogItem>;
  topicProgress: Record<string, TopicProgress>;
};

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

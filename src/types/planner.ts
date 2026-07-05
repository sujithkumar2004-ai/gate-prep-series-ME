export type ProgressStatus = "Not Started" | "In Progress" | "Done" | "Backlog";

export type DayKind = "Study" | "PYQ" | "Mock" | "Revision" | "Rest" | "Exam";

export type MasteryStatus = "Not Started" | "Learning" | "Practicing" | "Mastered" | "Weak";

export type MistakeType = "Concept" | "Formula" | "Calculation" | "Reading" | "Time" | "Silly";

export type PlannerUser = {
  id: string;
  username: string;
  displayName: string;
  role: "student" | "admin";
};

export type AuthSession = {
  token: string;
  user: PlannerUser;
  backendConnected: boolean;
};

export type WorkItemProgress = {
  done: boolean;
};

export type DailyProgress = {
  status: ProgressStatus;
  actualHours: number;
  pyqSolved: number;
  revisionDone: boolean;
  workItems: WorkItemProgress[];
  notes: string;
  mistakeType?: MistakeType;
};

export type TopicProgress = {
  subject: string;
  topic: string;
  mastery: MasteryStatus;
  plannedDays: number;
  doneDays: number;
  backlogDays: number;
  pyqSolved: number;
};

export type MockTestRecord = {
  id: string;
  date: string;
  name: string;
  targetScore: number;
  score?: number;
  accuracy?: number;
  attempted?: number;
  wrong?: number;
  analysisDone?: boolean;
  weaknessNotes?: string;
};

export type MistakeRecord = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  type: MistakeType;
  fix: string;
  resolved: boolean;
};

export type RevisionSchedule = {
  id: string;
  sourceDate: string;
  revisionDate: string;
  subject: string;
  topic: string;
  offsetDays: number;
  done: boolean;
};

export type BacklogItem = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  reason: string;
  recoveryDate: string;
  status: "Open" | "Scheduled" | "Recovered";
};

export type SalaryProfile = {
  monthlySalary: number;
  savingsGoal: number;
};

export type Expense = {
  id: string;
  label: string;
  amount: number;
  category: "Study" | "Food" | "Travel" | "Gym" | "Bills" | "Other";
};

export type GymRoutine = {
  weeklyGoal: string;
  sessions: { day: string; focus: string; durationMinutes: number }[];
};

export type SyllabusTopic = {
  id: string;
  title: string;
  planned: boolean;
};

export type SubjectSyllabus = {
  id: string;
  section: string;
  subject: string;
  topics: SyllabusTopic[];
};

export type PlannerDay = {
  id: string;
  date: string;
  day: string;
  phaseId: number;
  phase: string;
  week: string;
  subject: string;
  topic: string;
  task: string;
  workItems: string[];
  targetHours: number;
  kind: DayKind;
  pyqTarget: number;
  revision: string;
  test: string;
  status: ProgressStatus;
  notes: string | null;
};

export type PlannerPhase = {
  id: number;
  title: string;
  dates: string;
  duration: string;
  goal: string;
  weeks: {
    label: string;
    days: {
      id: string;
      date: string;
      task: string;
      workItems: string[];
      hours: string;
      kind: DayKind;
    }[];
  }[];
};

export type PlannerData = {
  metadata: {
    name: string;
    sourceOfTruth: string;
    startDate: string;
    syllabusCompletionDate: string;
    examDate: string;
    rule: string;
    backendMode: string;
  };
  phases: PlannerPhase[];
  daywisePlan: PlannerDay[];
  syllabusMap: SubjectSyllabus[];
  mockTests: MockTestRecord[];
  salaryExpense: SalaryProfile & {
    fixedExpenses: Expense[];
    studyBudget: Expense[];
  };
  gymRoutine: GymRoutine;
  intelligenceRules: {
    dailyScore: string;
    readinessScore: string;
    weakTopicDetection: string;
    spacedRevisionOffsets: number[];
  };
};

export type PlannerState = {
  dailyProgress: Record<string, DailyProgress>;
  mockTests: Record<string, MockTestRecord>;
  mistakes: MistakeRecord[];
  backlog: BacklogItem[];
  expenses: Expense[];
  salary: SalaryProfile;
  gymRoutine: GymRoutine;
};

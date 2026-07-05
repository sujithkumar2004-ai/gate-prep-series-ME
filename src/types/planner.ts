export type ProgressStatus = "Not Started" | "In Progress" | "Done" | "Backlog";

export type DayKind = "Study" | "PYQ" | "Mock" | "Revision" | "Rest" | "Exam";

export type MasteryStatus =
  | "Not Started"
  | "Learning"
  | "Notes Done"
  | "PYQ Started"
  | "PYQ Done"
  | "Revision Due"
  | "Revised"
  | "Weak"
  | "Mastered";

export type MistakeType =
  | "Concept gap"
  | "Formula mistake"
  | "Calculation mistake"
  | "Silly mistake"
  | "Time pressure"
  | "Wrong approach"
  | "Memory gap"
  | "Skipped revision";

export type EmergencyMode = "Normal Mode" | "Backlog Mode" | "Crash Mode" | "Mock-Only Mode";

export type DailyScoreLabel = "Failed Day" | "Acceptable Day" | "Strong Day" | "Superhuman Day";

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
  actualMinutes: number;
  actualHours: number;
  conceptDone: boolean;
  notesDone: boolean;
  pyqSolved: number;
  pyqAccuracy: number;
  mockAnalysisDone: boolean;
  revisionDone: boolean;
  workItems: WorkItemProgress[];
  skipReason: string;
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
  revisionsDone: number;
  accuracy: number;
  lastRevisionDate?: string;
};

export type MockTestRecord = {
  id: string;
  date: string;
  mockNumber?: number;
  name: string;
  targetScore: number;
  totalMarks?: number;
  score?: number;
  accuracy?: number;
  attempted?: number;
  correct?: number;
  wrong?: number;
  timeSpentMinutes?: number;
  subjectWiseScore?: Record<string, number>;
  weakTopics?: string[];
  topMistakes?: string[];
  actionPlan?: string;
  retryTopics?: string[];
  analysisDone?: boolean;
  weaknessNotes?: string;
};

export type MistakeRecord = {
  id: string;
  date: string;
  questionSource: string;
  subject: string;
  topic: string;
  type: MistakeType;
  explanation: string;
  correctMethod: string;
  retryDate: string;
  fixed: boolean;
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

export type IncomeEntry = {
  id: string;
  label: string;
  amount: number;
  date: string;
};

export type GymRoutine = {
  weeklyGoal: string;
  sessions: { day: string; focus: string; durationMinutes: number; exercises?: string[]; sets?: number; reps?: string }[];
};

export type GymLog = {
  id: string;
  date: string;
  session: string;
  attended: boolean;
  bodyweight?: number;
  recoveryNotes?: string;
};

export type SyllabusTopic = {
  id: string;
  title: string;
  planned: boolean;
  weightage: number;
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
  seedData: {
    revisionCycles: string[];
    mistakeCategories: MistakeType[];
    financeCategories: Expense["category"][];
    gymCategories: string[];
  };
};

export type PlannerState = {
  dailyProgress: Record<string, DailyProgress>;
  mockTests: Record<string, MockTestRecord>;
  mistakes: MistakeRecord[];
  backlog: BacklogItem[];
  income: IncomeEntry[];
  expenses: Expense[];
  salary: SalaryProfile;
  gymRoutine: GymRoutine;
  gymLogs: GymLog[];
};

export type PYQSession = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  attempted: number;
  correct: number;
  source: string;
};

export type FormulaEntry = {
  id: string;
  formula: string;
  subject: string;
  topic: string;
  usage: string;
  example: string;
  lastRevisedDate?: string;
  nextRevisionDate?: string;
  confidenceScore: number;
  quizHidden: boolean;
};

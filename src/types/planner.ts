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

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export type RecallRating = "forgot" | "partial" | "perfect";

export type TimerMode = "Pomodoro" | "Deep Work 90";

export type ReminderType = "Daily Study Start" | "Revision Due" | "Mock Test" | "Backlog Warning" | "Weekly Review";

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

export type TargetScoreSystem = {
  targetMarks: number;
  targetRank: number;
  targetPercentile: number;
  subjectTargets: Record<string, number>;
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
  questionsSeen?: number;
  skipped?: number;
  guessed?: number;
  negativeMarksLost?: number;
  timePerQuestion?: number;
  easyAccuracy?: number;
  mediumAccuracy?: number;
  hardAccuracy?: number;
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

export type QuestionBankItem = {
  id: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  source: string;
  solved: boolean;
  accuracy: number;
  retryNeeded: boolean;
  bookmarked: boolean;
  confidenceBefore?: number;
  correctAfter?: boolean;
};

export type Flashcard = {
  id: string;
  kind: "Concept" | "Formula" | "Mistake";
  subject: string;
  topic: string;
  front: string;
  back: string;
  selfRating?: RecallRating;
  nextRevisionDate: string;
};

export type DeepWorkSession = {
  id: string;
  date: string;
  mode: TimerMode;
  subject: string;
  task: string;
  distractionCount: number;
  pauseReason: string;
  completedMinutes: number;
};

export type EnergyLog = {
  id: string;
  date: string;
  sleepHours: number;
  energyLevel: number;
  focusLevel: number;
  stressLevel: number;
  workoutDone: boolean;
  linkedMockScore?: number;
};

export type Reminder = {
  id: string;
  type: ReminderType;
  title: string;
  dueAt: string;
  enabled: boolean;
};

export type WeeklyReview = {
  week: string;
  topicsCompleted: number;
  pyqSolved: number;
  mockAverage: number;
  repeatedMistakes: string[];
  backlogAdded: number;
  backlogCleared: number;
  nextWeekTarget: string;
  weeklyScore: number;
};

export type MonthlyReview = {
  month: string;
  syllabusCompletion: number;
  subjectReadiness: Record<string, number>;
  mockAverage: number;
  strongestTopics: string[];
  weakestTopics: string[];
  revisionDelay: number;
  expectedExamReadiness: number;
  nextMonthBattlePlan: string;
};

export type ExamSimulation = {
  id: string;
  date: string;
  fullLengthMinutes: number;
  sectionTimers: Record<string, number>;
  negativeMarkingLost: number;
  attemptStrategy: string;
  postExamAnalysis: string;
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
    questionSources?: string[];
    reminderTypes?: ReminderType[];
  };
  defaultTargets: TargetScoreSystem;
  defaultQuestionBank: QuestionBankItem[];
  defaultFlashcards: Flashcard[];
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
  targets: TargetScoreSystem;
  questionBank: QuestionBankItem[];
  flashcards: Flashcard[];
  deepWorkSessions: DeepWorkSession[];
  energyLogs: EnergyLog[];
  reminders: Reminder[];
  examSimulations: ExamSimulation[];
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

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

export type MistakeType =
  | "Concept gap"
  | "Formula mistake"
  | "Calculation mistake"
  | "Silly mistake"
  | "Time pressure"
  | "Wrong approach"
  | "Memory gap"
  | "Skipped revision";

export type QuestionSource = "PYQ" | "Test Series" | "Textbook" | "Custom";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export type TimerMode = "Pomodoro" | "Deep Work" | "Custom";

export type RecallRating = "forgot" | "partial" | "perfect";

export type DailyScoreLabel = "Failed Day" | "Acceptable Day" | "Strong Day" | "Superhuman Day";

export type ReminderType = "daily_study_start" | "revision_due" | "mock_test" | "backlog_warning" | "weekly_review";

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
  pyqSessions: Record<string, PYQSession>;
  questionBank: Record<string, QuestionBankItem>;
  mockTests: Record<string, MockTest>;
  mistakes: Record<string, Mistake>;
  attemptStrategies: Record<string, AttemptStrategy>;
  deepWorkSessions: Record<string, DeepWorkSession>;
  activeRecallCards: Record<string, ActiveRecallCard>;
  energyLogs: Record<string, EnergyLog>;
  gymLogs: Record<string, GymLog>;
  reminders: Record<string, Reminder>;
  weeklyReviews: Record<string, WeeklyReview>;
  monthlyReviews: Record<string, MonthlyReview>;
};

export type PYQSession = {
  id: string;
  date: string;
  subjectId: string;
  topicId: string;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  timeSpentMinutes: number;
  sourceYear: string;
  retryNeeded: boolean;
  bookmarked: boolean;
  notes: string;
};

export type PYQQuestion = {
  id: string;
  sessionId: string;
  topicId: string;
  label: string;
  isCorrect: boolean;
  timeSpentMinutes: number;
};

export type MockSubjectScore = {
  subjectId: string;
  score: number;
  attempted: number;
  correct: number;
  wrong: number;
};

export type MockMistake = {
  mistakeType: MistakeType;
  count: number;
};

export type MockTest = {
  id: string;
  mockNumber: number;
  date: string;
  totalMarks: number;
  score: number;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  timeSpentMinutes: number;
  subjectWiseScore: MockSubjectScore[];
  weakTopicIds: string[];
  topMistakes: MockMistake[];
  actionPlan: string;
  retryTopicIds: string[];
};

export type Mistake = {
  id: string;
  sourceType: "pyq" | "mock" | "question_bank" | "custom";
  sourceId: string;
  subjectId: string;
  topicId: string;
  mistakeType: MistakeType;
  questionLabel: string;
  explanation: string;
  correctMethod: string;
  retryDate: string;
  isFixed: boolean;
  createdAt: string;
  fixedAt?: string;
};

export type WeakTopic = {
  subjectId: string;
  topicId: string;
  weaknessScore: number;
  reason: string;
  recommendedAction: string;
  priority: "Low" | "Medium" | "High";
  lastActivityDate?: string;
};

export type ReadinessScore = {
  overall: number;
  syllabusMastery: number;
  pyqCompletion: number;
  mockPerformance: number;
  revisionConsistency: number;
  disciplineScore: number;
  requiredScoreImprovement: number;
};

export type PriorityScore = {
  subjectId: string;
  topicId: string;
  score: number;
  reason: string;
};

export type QuestionBankItem = {
  id: string;
  subjectId: string;
  topicId: string;
  questionLabel: string;
  source: QuestionSource;
  difficulty: QuestionDifficulty;
  solved: boolean;
  accuracy: number;
  retryNeeded: boolean;
  bookmarked: boolean;
  notes: string;
};

export type AttemptStrategy = {
  id: string;
  mockId?: string;
  date: string;
  questionsSeen: number;
  questionsAttempted: number;
  questionsSkipped: number;
  guessedQuestions: number;
  negativeMarksLost: number;
  timePerQuestion: number;
  easyAccuracy: number;
  mediumAccuracy: number;
  hardAccuracy: number;
};

export type DailyScore = {
  date: string;
  score: number;
  label: DailyScoreLabel;
  conceptStudy: number;
  pyqSolving: number;
  revision: number;
  mockErrorAnalysis: number;
  discipline: number;
  skippedPenalty: number;
  distractionPenalty: number;
  deepWorkBonus: number;
};

export type DistractionLog = {
  id: string;
  reason: string;
  timestamp: string;
};

export type SkipReason = {
  taskId: string;
  topicId: string;
  reason: string;
  date: string;
};

export type DeepWorkSession = {
  id: string;
  date: string;
  mode: TimerMode;
  subjectId: string;
  topicId: string;
  taskId?: string;
  plannedMinutes: number;
  completedMinutes: number;
  status: "idle" | "running" | "paused" | "completed";
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  pauseReason: string;
  notes: string;
  distractions: DistractionLog[];
};

export type WeeklyReview = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  topicsCompleted: number;
  pyqsSolved: number;
  mocksCompleted: number;
  averageDailyScore: number;
  bestDay?: string;
  worstDay?: string;
  mistakesRepeated: number;
  backlogAdded: number;
  backlogCleared: number;
  revisionConsistency: number;
  nextWeekTarget: string;
  weeklyScore: number;
  reflectionNotes: string;
};

export type MonthlyReview = {
  id: string;
  month: string;
  syllabusCompletion: number;
  subjectWiseReadiness: Record<string, number>;
  mockAverage: number;
  strongestTopics: string[];
  weakestTopics: string[];
  revisionDelay: number;
  dailyScoreAverage: number;
  backlogTrend: string;
  expectedExamReadiness: number;
  nextMonthBattlePlan: string;
  reflectionNotes: string;
};

export type ActiveRecallCard = {
  id: string;
  cardType: "concept" | "formula" | "mistake";
  subjectId: string;
  topicId: string;
  front: string;
  back: string;
  lastReviewedAt?: string;
  nextReviewAt: string;
  rating?: RecallRating;
  confidence: number;
  createdAt: string;
};

export type EnergyLog = {
  id: string;
  date: string;
  sleepHours: number;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  focusLevel: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  workoutDone: boolean;
  notes: string;
};

export type GymLog = {
  id: string;
  date: string;
  routineTitle: string;
  exercises: { name: string; sets: number; reps: string; completed: boolean }[];
  workoutCompleted: boolean;
  bodyweight?: number;
  recoveryNotes: string;
};

export type Reminder = {
  id: string;
  type: ReminderType;
  title: string;
  time: string;
  enabled: boolean;
};

export type NotificationPreference = {
  remindersEnabled: boolean;
  permission: "default" | "granted" | "denied" | "unsupported";
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

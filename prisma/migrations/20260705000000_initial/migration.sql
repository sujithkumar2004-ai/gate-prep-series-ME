-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weightage" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "plannedMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "skipReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalPlannedTasks" INTEGER NOT NULL,
    "completedTasks" INTEGER NOT NULL,
    "skippedTasks" INTEGER NOT NULL,
    "pendingTasks" INTEGER NOT NULL,
    "plannedMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER NOT NULL,
    "completionPercentage" INTEGER NOT NULL,
    "dailyScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceTaskId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "cycle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklogItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "recoveryDate" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recoveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BacklogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PYQSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctQuestions" INTEGER NOT NULL,
    "wrongQuestions" INTEGER NOT NULL,
    "timeSpentMinutes" INTEGER NOT NULL,
    "sourceYear" TEXT NOT NULL,
    "retryNeeded" BOOLEAN NOT NULL,
    "bookmarked" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PYQSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PYQQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PYQQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "timeSpentMinutes" INTEGER NOT NULL,
    "actionPlan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockSubjectScore" (
    "id" TEXT NOT NULL,
    "mockId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockSubjectScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "mistakeType" TEXT NOT NULL,
    "questionLabel" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "correctMethod" TEXT NOT NULL,
    "retryDate" TIMESTAMP(3) NOT NULL,
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fixedAt" TIMESTAMP(3),

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBankItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionLabel" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "solved" BOOLEAN NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "retryNeeded" BOOLEAN NOT NULL,
    "bookmarked" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeepWorkSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mode" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "taskId" TEXT,
    "plannedMinutes" INTEGER NOT NULL,
    "completedMinutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pauseReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeepWorkSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistractionLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistractionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "weeklyScore" INTEGER NOT NULL,
    "reflectionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "expectedExamReadiness" INTEGER NOT NULL,
    "reflectionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveRecallCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "rating" TEXT,
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveRecallCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "focusLevel" INTEGER NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "workoutDone" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "routineTitle" TEXT NOT NULL,
    "workoutCompleted" BOOLEAN NOT NULL,
    "bodyweight" DOUBLE PRECISION,
    "recoveryNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GymLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Subject_section_idx" ON "Subject"("section");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "Topic"("subjectId");

-- CreateIndex
CREATE INDEX "Topic_weightage_idx" ON "Topic"("weightage");

-- CreateIndex
CREATE INDEX "Topic_priority_idx" ON "Topic"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_title_key" ON "Topic"("subjectId", "title");

-- CreateIndex
CREATE INDEX "DailyTask_userId_idx" ON "DailyTask"("userId");

-- CreateIndex
CREATE INDEX "DailyTask_subjectId_idx" ON "DailyTask"("subjectId");

-- CreateIndex
CREATE INDEX "DailyTask_topicId_idx" ON "DailyTask"("topicId");

-- CreateIndex
CREATE INDEX "DailyTask_date_idx" ON "DailyTask"("date");

-- CreateIndex
CREATE INDEX "DailyTask_status_idx" ON "DailyTask"("status");

-- CreateIndex
CREATE INDEX "DailyProgress_userId_idx" ON "DailyProgress"("userId");

-- CreateIndex
CREATE INDEX "DailyProgress_date_idx" ON "DailyProgress"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyProgress_userId_date_key" ON "DailyProgress"("userId", "date");

-- CreateIndex
CREATE INDEX "RevisionItem_userId_idx" ON "RevisionItem"("userId");

-- CreateIndex
CREATE INDEX "RevisionItem_subjectId_idx" ON "RevisionItem"("subjectId");

-- CreateIndex
CREATE INDEX "RevisionItem_topicId_idx" ON "RevisionItem"("topicId");

-- CreateIndex
CREATE INDEX "RevisionItem_dueDate_idx" ON "RevisionItem"("dueDate");

-- CreateIndex
CREATE INDEX "RevisionItem_status_idx" ON "RevisionItem"("status");

-- CreateIndex
CREATE INDEX "BacklogItem_userId_idx" ON "BacklogItem"("userId");

-- CreateIndex
CREATE INDEX "BacklogItem_subjectId_idx" ON "BacklogItem"("subjectId");

-- CreateIndex
CREATE INDEX "BacklogItem_topicId_idx" ON "BacklogItem"("topicId");

-- CreateIndex
CREATE INDEX "BacklogItem_date_idx" ON "BacklogItem"("date");

-- CreateIndex
CREATE INDEX "BacklogItem_recoveryDate_idx" ON "BacklogItem"("recoveryDate");

-- CreateIndex
CREATE INDEX "BacklogItem_status_idx" ON "BacklogItem"("status");

-- CreateIndex
CREATE INDEX "PYQSession_userId_idx" ON "PYQSession"("userId");

-- CreateIndex
CREATE INDEX "PYQSession_subjectId_idx" ON "PYQSession"("subjectId");

-- CreateIndex
CREATE INDEX "PYQSession_topicId_idx" ON "PYQSession"("topicId");

-- CreateIndex
CREATE INDEX "PYQSession_date_idx" ON "PYQSession"("date");

-- CreateIndex
CREATE INDEX "PYQQuestion_sessionId_idx" ON "PYQQuestion"("sessionId");

-- CreateIndex
CREATE INDEX "PYQQuestion_topicId_idx" ON "PYQQuestion"("topicId");

-- CreateIndex
CREATE INDEX "MockTest_userId_idx" ON "MockTest"("userId");

-- CreateIndex
CREATE INDEX "MockTest_date_idx" ON "MockTest"("date");

-- CreateIndex
CREATE INDEX "MockTest_createdAt_idx" ON "MockTest"("createdAt");

-- CreateIndex
CREATE INDEX "MockSubjectScore_mockId_idx" ON "MockSubjectScore"("mockId");

-- CreateIndex
CREATE INDEX "MockSubjectScore_subjectId_idx" ON "MockSubjectScore"("subjectId");

-- CreateIndex
CREATE INDEX "Mistake_userId_idx" ON "Mistake"("userId");

-- CreateIndex
CREATE INDEX "Mistake_subjectId_idx" ON "Mistake"("subjectId");

-- CreateIndex
CREATE INDEX "Mistake_topicId_idx" ON "Mistake"("topicId");

-- CreateIndex
CREATE INDEX "Mistake_retryDate_idx" ON "Mistake"("retryDate");

-- CreateIndex
CREATE INDEX "Mistake_createdAt_idx" ON "Mistake"("createdAt");

-- CreateIndex
CREATE INDEX "Mistake_isFixed_idx" ON "Mistake"("isFixed");

-- CreateIndex
CREATE INDEX "QuestionBankItem_userId_idx" ON "QuestionBankItem"("userId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_subjectId_idx" ON "QuestionBankItem"("subjectId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_topicId_idx" ON "QuestionBankItem"("topicId");

-- CreateIndex
CREATE INDEX "QuestionBankItem_solved_idx" ON "QuestionBankItem"("solved");

-- CreateIndex
CREATE INDEX "QuestionBankItem_bookmarked_idx" ON "QuestionBankItem"("bookmarked");

-- CreateIndex
CREATE INDEX "DeepWorkSession_userId_idx" ON "DeepWorkSession"("userId");

-- CreateIndex
CREATE INDEX "DeepWorkSession_subjectId_idx" ON "DeepWorkSession"("subjectId");

-- CreateIndex
CREATE INDEX "DeepWorkSession_topicId_idx" ON "DeepWorkSession"("topicId");

-- CreateIndex
CREATE INDEX "DeepWorkSession_date_idx" ON "DeepWorkSession"("date");

-- CreateIndex
CREATE INDEX "DeepWorkSession_status_idx" ON "DeepWorkSession"("status");

-- CreateIndex
CREATE INDEX "DistractionLog_sessionId_idx" ON "DistractionLog"("sessionId");

-- CreateIndex
CREATE INDEX "DistractionLog_timestamp_idx" ON "DistractionLog"("timestamp");

-- CreateIndex
CREATE INDEX "WeeklyReview_userId_idx" ON "WeeklyReview"("userId");

-- CreateIndex
CREATE INDEX "WeeklyReview_weekStartDate_idx" ON "WeeklyReview"("weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_userId_weekStartDate_key" ON "WeeklyReview"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "MonthlyReview_userId_idx" ON "MonthlyReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReview_userId_month_key" ON "MonthlyReview"("userId", "month");

-- CreateIndex
CREATE INDEX "ActiveRecallCard_userId_idx" ON "ActiveRecallCard"("userId");

-- CreateIndex
CREATE INDEX "ActiveRecallCard_subjectId_idx" ON "ActiveRecallCard"("subjectId");

-- CreateIndex
CREATE INDEX "ActiveRecallCard_topicId_idx" ON "ActiveRecallCard"("topicId");

-- CreateIndex
CREATE INDEX "ActiveRecallCard_nextReviewAt_idx" ON "ActiveRecallCard"("nextReviewAt");

-- CreateIndex
CREATE INDEX "ActiveRecallCard_createdAt_idx" ON "ActiveRecallCard"("createdAt");

-- CreateIndex
CREATE INDEX "EnergyLog_userId_idx" ON "EnergyLog"("userId");

-- CreateIndex
CREATE INDEX "EnergyLog_date_idx" ON "EnergyLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyLog_userId_date_key" ON "EnergyLog"("userId", "date");

-- CreateIndex
CREATE INDEX "GymLog_userId_idx" ON "GymLog"("userId");

-- CreateIndex
CREATE INDEX "GymLog_date_idx" ON "GymLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "GymLog_userId_date_key" ON "GymLog"("userId", "date");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_userId_type_key" ON "Reminder"("userId", "type");

-- CreateIndex
CREATE INDEX "SalaryEntry_userId_idx" ON "SalaryEntry"("userId");

-- CreateIndex
CREATE INDEX "SalaryEntry_date_idx" ON "SalaryEntry"("date");

-- CreateIndex
CREATE INDEX "ExpenseEntry_userId_idx" ON "ExpenseEntry"("userId");

-- CreateIndex
CREATE INDEX "ExpenseEntry_date_idx" ON "ExpenseEntry"("date");

-- CreateIndex
CREATE INDEX "ExpenseEntry_category_idx" ON "ExpenseEntry"("category");

-- CreateIndex
CREATE INDEX "AppSetting_userId_idx" ON "AppSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_userId_key_key" ON "AppSetting"("userId", "key");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


"use client";

import { BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Flame, Server } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { strategyCards } from "../config/appConfig";
import {
  computeMetrics,
  formatDate,
  plannerData,
  rowKey
} from "../lib/plannerData";
import { createInitialPlannerState, loadProgress, persistProgress } from "../services/progressService";
import { createBacklogFromMissedTasks, markBacklogRecovered } from "../services/backlogService";
import { patchTask, validateTaskStatus } from "../services/dailyPlanService";
import { syncRowEditFromTaskState } from "../services/plannerService";
import { ensureRevisionItems, markRevisionCompleted } from "../services/revisionService";
import { clearSession, readSavedSession, saveSession } from "../services/sessionService";
import { login, logout } from "../services/authService";
import { detectLegacyLocalData, migrateLocalStorageData } from "../services/migrationService";
import { updateTopicAccuracy } from "../services/topicService";
import { savePYQSession } from "../services/pyqService";
import { addQuestionBankItem } from "../services/questionBankService";
import { addMockTest } from "../services/mockService";
import { addMistake, markMistakeFixed } from "../services/mistakeService";
import { calculateDailyScore } from "../services/dailyScoreService";
import { completeDeepWorkSession, logDistraction, pauseDeepWorkSession, resumeDeepWorkSession, startDeepWorkSession, upsertDeepWorkSession } from "../services/deepWorkService";
import { saveEnergyLog } from "../services/energyService";
import { saveGymLog } from "../services/gymService";
import { rateRecallCard } from "../services/activeRecallService";
import { requestNotificationPermission, updateReminder } from "../services/reminderService";
import type { Account, AttemptStrategy, AuthSession, BackendStatus, DailyTask, DailyTaskStatus, DeepWorkSession, EnergyLog, GymLog, Mistake, MockTest, PlannerState, PYQSession, QuestionBankItem, RecallRating, Reminder, RowEdit, Status, SyncStatus } from "../types/planner";
import { ActiveRecallView } from "./planner/ActiveRecallView";
import { AnalyticsView } from "./planner/AnalyticsView";
import { AttemptStrategyView } from "./planner/AttemptStrategyView";
import { BacklogRecovery } from "./planner/BacklogRecovery";
import { DailyPlanView } from "./planner/DailyPlanView";
import { DashboardView } from "./planner/DashboardView";
import { DeepWorkTimer } from "./planner/DeepWorkTimer";
import { DaywiseTable } from "./planner/DaywiseTable";
import { DisciplineView } from "./planner/DisciplineView";
import { EnergyTracker } from "./planner/EnergyTracker";
import { GymRoutineView } from "./planner/GymRoutineView";
import { LoginPanel } from "./planner/LoginPanel";
import { MistakeNotebook } from "./planner/MistakeNotebook";
import { MockAnalysis } from "./planner/MockAnalysis";
import { PhaseCalendar } from "./planner/PhaseCalendar";
import { PlannerHero } from "./planner/PlannerHero";
import { PlannerTabs, type PlannerTab } from "./planner/PlannerTabs";
import { PlannerToolbar } from "./planner/PlannerToolbar";
import { PYQTracker } from "./planner/PYQTracker";
import { QuestionBank } from "./planner/QuestionBank";
import { ReminderSettings } from "./planner/ReminderSettings";
import { RevisionSystem } from "./planner/RevisionSystem";
import { MonthlyReviewView, WeeklyReviewView } from "./planner/ReviewViews";
import { Metric } from "./planner/Shared";
import { SyllabusMap } from "./planner/SyllabusMap";
import { SyllabusTracker } from "./planner/SyllabusTracker";
import { WeaknessEngine } from "./planner/WeaknessEngine";
import { WeeklyTracker } from "./planner/WeeklyTracker";

export function PlannerApp() {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [plannerState, setPlannerState] = useState<PlannerState>(() => createInitialPlannerState());
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("All");
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [activeTab, setActiveTab] = useState<PlannerTab>("dashboard");
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local only");
  const [loadError, setLoadError] = useState("");
  const [hasLegacyData, setHasLegacyData] = useState(false);

  useEffect(() => {
    const saved = readSavedSession();
    if (saved) {
      setSession(saved);
      setCurrentUser(saved.user);
      setSyncStatus("syncing");
      loadProgress(saved.user.id ?? saved.user.email, saved.token)
        .then((result) => {
          setPlannerState(result.state);
          setSyncStatus(result.fallbackUsed ? "local only" : "synced");
          setHasLoadedProgress(true);
          setHasLegacyData(detectLegacyLocalData(saved.user.id ?? saved.user.email));
        })
        .catch((error) => {
          setLoadError(error instanceof Error ? error.message : "Unable to load progress");
          setSyncStatus("sync failed");
        })
        .finally(() => setIsAuthReady(true));
      return;
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (currentUser && hasLoadedProgress) {
      setSyncStatus("syncing");
      persistProgress(currentUser.id ?? currentUser.email, plannerState, session?.token)
        .then((result) => setSyncStatus(result.fallbackUsed ? "local only" : "synced"))
        .catch(() => setSyncStatus("sync failed"));
    }
  }, [currentUser, hasLoadedProgress, plannerState, session?.token]);

  useEffect(() => {
    let isActive = true;
    fetch("/api/planner")
      .then((response) => response.json())
      .then((data: BackendStatus) => {
        if (isActive) setBackendStatus(data);
      })
      .catch(() => {
        if (isActive) setBackendStatus(null);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const phases = useMemo(() => ["All", ...plannerData.phases.map((item) => item.title)], []);
  const subjects = useMemo(() => ["All", ...Array.from(new Set(plannerData.days.map((row) => row.mainSubject)))], []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return plannerData.days.filter((row) => {
      const edit = plannerState.rowEdits[rowKey(row)];
      const matchesQuery =
        !needle ||
        [row.topic, row.dailyTask, row.workItems.join(" "), row.mainSubject, row.phase, row.week]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return (
        matchesQuery &&
        (phase === "All" || row.phase === phase) &&
        (subject === "All" || row.mainSubject === subject) &&
        (status === "All" || edit?.status === status)
      );
    });
  }, [phase, plannerState.rowEdits, query, status, subject]);

  const metrics = useMemo(() => computeMetrics(plannerState.rowEdits), [plannerState.rowEdits]);

  const nextRow = useMemo(() => {
    return plannerData.days.find((row) => plannerState.rowEdits[rowKey(row)]?.status !== "Done") ?? plannerData.days[plannerData.days.length - 1];
  }, [plannerState.rowEdits]);

  function updateRow(key: string, patch: Partial<RowEdit>) {
    setPlannerState((current) => ({
      ...current,
      rowEdits: {
        ...current.rowEdits,
        [key]: {
          ...current.rowEdits[key],
          ...patch
        }
      }
    }));
  }

  function resetProgress() {
    setPlannerState(createInitialPlannerState());
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(plannerState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gate-me-planner-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setSyncStatus("syncing");
    login(loginEmail.trim().toLowerCase(), loginPassword)
      .then(async (nextSession) => {
        setSession(nextSession);
        setCurrentUser(nextSession.user);
        saveSession(nextSession);
        const result = await loadProgress(nextSession.user.id ?? nextSession.user.email, nextSession.token);
        setPlannerState(result.state);
        setHasLoadedProgress(true);
        setHasLegacyData(detectLegacyLocalData(nextSession.user.id ?? nextSession.user.email));
        setSyncStatus(result.fallbackUsed ? "local only" : "synced");
        setLoginEmail("");
        setLoginPassword("");
      })
      .catch((error) => {
        setLoginError(error instanceof Error ? error.message : "Login failed");
        setSyncStatus("sync failed");
      });
  }

  function handleLogout() {
    logout(session?.token);
    clearSession();
    setSession(null);
    setCurrentUser(null);
    setHasLoadedProgress(false);
    setPlannerState(createInitialPlannerState());
  }

  function migrateLocalData() {
    if (!currentUser) return;
    setPlannerState(migrateLocalStorageData(currentUser.id ?? currentUser.email));
    setHasLegacyData(false);
    setSyncStatus("local only");
  }

  function updateDailyTask(task: DailyTask, status: DailyTaskStatus, actualMinutes: number, skipReason: string) {
    if (!validateTaskStatus(status, skipReason)) {
      window.alert("Skip reason is required when a task is skipped.");
      return;
    }
    setPlannerState((current) => {
      if (task.id.startsWith("revision-task-")) {
        const revisionId = task.id.replace("revision-task-", "");
        return status === "completed" ? markRevisionCompleted(current, revisionId) : current;
      }
      if (task.id.startsWith("backlog-task-")) {
        const backlogId = task.id.replace("backlog-task-", "");
        return status === "completed" ? markBacklogRecovered(current, backlogId) : current;
      }
      let next = patchTask(current, task.id, { status, actualMinutes, skipReason });
      const updatedTask = next.tasks[task.id];
      if (updatedTask?.type === "concept" && updatedTask.status === "completed") {
        next = ensureRevisionItems(next, updatedTask);
      }
      if (updatedTask && updatedTask.status === "skipped") {
        next = createBacklogFromMissedTasks(next, updatedTask, skipReason);
      }
      return syncRowEditFromTaskState(next);
    });
  }

  function completeRevision(revisionId: string) {
    setPlannerState((current) => syncRowEditFromTaskState(markRevisionCompleted(current, revisionId)));
  }

  function recoverBacklog(backlogId: string) {
    setPlannerState((current) => markBacklogRecovered(current, backlogId));
  }

  function changeTopicAccuracy(topicId: string, accuracy: number) {
    setPlannerState((current) => updateTopicAccuracy(current, topicId, accuracy));
  }

  function savePyq(session: Omit<PYQSession, "id">) {
    setPlannerState((current) => savePYQSession(current, session));
  }

  function addQuestion(item: Omit<QuestionBankItem, "id">) {
    setPlannerState((current) => addQuestionBankItem(current, item));
  }

  function saveMock(mock: Omit<MockTest, "id" | "accuracy">) {
    setPlannerState((current) => addMockTest(current, mock));
  }

  function saveMistake(mistake: Omit<Mistake, "id" | "createdAt" | "isFixed">) {
    setPlannerState((current) => addMistake(current, mistake));
  }

  function fixMistake(id: string) {
    setPlannerState((current) => markMistakeFixed(current, id));
  }

  function saveAttemptStrategy(strategy: Omit<AttemptStrategy, "id">) {
    setPlannerState((current) => {
      const id = `attempt-${Date.now()}`;
      return { ...current, attemptStrategies: { ...current.attemptStrategies, [id]: { ...strategy, id } } };
    });
  }

  function createDeepSession(session: DeepWorkSession) {
    setPlannerState((current) => upsertDeepWorkSession(current, session));
  }

  function completeDeepSession(id: string, minutes: number) {
    setPlannerState((current) => syncRowEditFromTaskState(completeDeepWorkSession(current, id, minutes)));
  }

  function rateRecall(id: string, rating: RecallRating) {
    setPlannerState((current) => rateRecallCard(current, id, rating));
  }

  function saveEnergy(log: Omit<EnergyLog, "id">) {
    setPlannerState((current) => saveEnergyLog(current, log));
  }

  function saveGym(log: Omit<GymLog, "id">) {
    setPlannerState((current) => saveGymLog(current, log));
  }

  function changeReminder(id: string, patch: Partial<Reminder>) {
    setPlannerState((current) => updateReminder(current, id, patch));
  }

  async function enableNotifications() {
    await requestNotificationPermission();
  }

  if (!isAuthReady) {
    return <main className="loginShell" />;
  }

  if (!currentUser) {
    return (
      <LoginPanel
        email={loginEmail}
        password={loginPassword}
        error={loginError}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <main>
      <PlannerHero
        currentUser={currentUser}
        completion={metrics.completion}
        planStartDate={plannerData.planStartDate}
        planEndDate={plannerData.planEndDate}
        syllabusCompletionDate={plannerData.syllabusCompletionDate}
        nextRow={nextRow}
        onLogout={handleLogout}
      />

      <section className="metricGrid" aria-label="Planner summary">
        <Metric icon={<CalendarDays />} label="Plan Window" value={`${formatDate(plannerData.planStartDate)} - ${formatDate(plannerData.planEndDate)}`} />
        <Metric icon={<CheckCircle2 />} label="Syllabus Lock" value={formatDate(plannerData.syllabusCompletionDate)} />
        <Metric icon={<BookOpen />} label="Study Days" value={metrics.studyDays.toString()} />
        <Metric icon={<ClipboardList />} label="Rest Days" value={metrics.restDays.toString()} />
        <Metric icon={<CheckCircle2 />} label="Done" value={metrics.counts.Done.toString()} />
        <Metric icon={<ClipboardList />} label="Backlog" value={metrics.counts.Backlog.toString()} />
        <Metric icon={<BarChart3 />} label="Hours" value={`${metrics.actualHours}/${metrics.targetHours}`} />
        <Metric icon={<Server />} label="Backend" value={backendStatus?.status === "connected" ? "Connected" : "Checking"} />
        <Metric icon={<Server />} label="Sync" value={syncStatus} />
      </section>
      {(loadError || hasLegacyData) && (
        <section className="syncBanner">
          {loadError && <span>{loadError}</span>}
          {hasLegacyData && <button className="iconTextButton" onClick={migrateLocalData}>Import local planner data</button>}
        </section>
      )}

      <section className="strategyStrip" aria-label="Topper style strategy">
        {strategyCards.map((item) => (
          <article className="strategyCard" key={item.label}>
            <div>
              <Flame size={18} />
              <h2>{item.label}</h2>
            </div>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <PlannerToolbar
        query={query}
        phase={phase}
        subject={subject}
        status={status}
        phases={phases}
        subjects={subjects}
        onQueryChange={setQuery}
        onPhaseChange={setPhase}
        onSubjectChange={setSubject}
        onStatusChange={setStatus}
        onExport={exportProgress}
        onReset={resetProgress}
      />

      <PlannerTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" && <DashboardView state={plannerState} dailyScore={calculateDailyScore(plannerState)} />}
      {activeTab === "daily" && <DailyPlanView state={plannerState} onTaskUpdate={updateDailyTask} />}
      {activeTab === "syllabus" && <SyllabusTracker state={plannerState} onAccuracyChange={changeTopicAccuracy} />}
      {activeTab === "revision" && <RevisionSystem state={plannerState} onCompleteRevision={completeRevision} />}
      {activeTab === "backlog" && <BacklogRecovery state={plannerState} onRecover={recoverBacklog} />}
      {activeTab === "pyq" && <PYQTracker state={plannerState} onSave={savePyq} />}
      {activeTab === "question-bank" && <QuestionBank state={plannerState} onAdd={addQuestion} />}
      {activeTab === "mocks" && <><MockAnalysis state={plannerState} onAdd={saveMock} /><AttemptStrategyView state={plannerState} onAdd={saveAttemptStrategy} /></>}
      {activeTab === "mistakes" && <MistakeNotebook state={plannerState} onAdd={saveMistake} onFix={fixMistake} />}
      {activeTab === "weakness" && <WeaknessEngine state={plannerState} />}
      {activeTab === "analytics" && <AnalyticsView state={plannerState} />}
      {activeTab === "timer" && (
        <DeepWorkTimer
          state={plannerState}
          onCreate={createDeepSession}
          onStart={(id) => setPlannerState((current) => startDeepWorkSession(current, id))}
          onPause={(id, reason) => setPlannerState((current) => pauseDeepWorkSession(current, id, reason))}
          onResume={(id) => setPlannerState((current) => resumeDeepWorkSession(current, id))}
          onDistraction={(id, reason) => setPlannerState((current) => logDistraction(current, id, reason))}
          onComplete={completeDeepSession}
        />
      )}
      {activeTab === "discipline" && <DisciplineView state={plannerState} />}
      {activeTab === "weekly-review" && <WeeklyReviewView state={plannerState} />}
      {activeTab === "monthly-review" && <MonthlyReviewView state={plannerState} />}
      {activeTab === "recall" && <ActiveRecallView state={plannerState} onRate={rateRecall} />}
      {activeTab === "energy" && <EnergyTracker state={plannerState} onSave={saveEnergy} />}
      {activeTab === "gym" && <GymRoutineView state={plannerState} onSave={saveGym} />}
      {activeTab === "reminders" && <ReminderSettings state={plannerState} onUpdate={changeReminder} onEnable={enableNotifications} />}
      {activeTab === "calendar" && <PhaseCalendar plannerData={plannerData} edits={plannerState.rowEdits} phaseFilter={phase} />}
      {activeTab === "plan" && (
        <DaywiseTable rows={filteredRows} edits={plannerState.rowEdits} totalRows={metrics.total} onUpdateRow={updateRow} />
      )}
      {activeTab === "weeks" && <WeeklyTracker plannerData={plannerData} edits={plannerState.rowEdits} />}
      {activeTab === "syllabus-map" && <SyllabusMap syllabus={plannerData.syllabus} />}
    </main>
  );
}

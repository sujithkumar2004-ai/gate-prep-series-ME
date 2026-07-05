"use client";

import { BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Flame, Server } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { accounts, strategyCards } from "../config/appConfig";
import {
  computeMetrics,
  formatDate,
  plannerData,
  rowKey
} from "../lib/plannerData";
import { createInitialPlannerState, readUserProgress, saveUserProgress } from "../services/progressService";
import { createBacklogFromMissedTasks, markBacklogRecovered } from "../services/backlogService";
import { patchTask, validateTaskStatus } from "../services/dailyPlanService";
import { syncRowEditFromTaskState } from "../services/plannerService";
import { ensureRevisionItems, markRevisionCompleted } from "../services/revisionService";
import { clearSession, readSavedAccount, saveSession } from "../services/sessionService";
import { updateTopicAccuracy } from "../services/topicService";
import { savePYQSession } from "../services/pyqService";
import { addQuestionBankItem } from "../services/questionBankService";
import { addMockTest } from "../services/mockService";
import { addMistake, markMistakeFixed } from "../services/mistakeService";
import type { Account, AttemptStrategy, BackendStatus, DailyTask, DailyTaskStatus, Mistake, MockTest, PlannerState, PYQSession, QuestionBankItem, RowEdit, Status } from "../types/planner";
import { AnalyticsView } from "./planner/AnalyticsView";
import { AttemptStrategyView } from "./planner/AttemptStrategyView";
import { BacklogRecovery } from "./planner/BacklogRecovery";
import { DailyPlanView } from "./planner/DailyPlanView";
import { DashboardView } from "./planner/DashboardView";
import { DaywiseTable } from "./planner/DaywiseTable";
import { LoginPanel } from "./planner/LoginPanel";
import { MistakeNotebook } from "./planner/MistakeNotebook";
import { MockAnalysis } from "./planner/MockAnalysis";
import { PhaseCalendar } from "./planner/PhaseCalendar";
import { PlannerHero } from "./planner/PlannerHero";
import { PlannerTabs, type PlannerTab } from "./planner/PlannerTabs";
import { PlannerToolbar } from "./planner/PlannerToolbar";
import { PYQTracker } from "./planner/PYQTracker";
import { QuestionBank } from "./planner/QuestionBank";
import { RevisionSystem } from "./planner/RevisionSystem";
import { Metric } from "./planner/Shared";
import { SyllabusMap } from "./planner/SyllabusMap";
import { SyllabusTracker } from "./planner/SyllabusTracker";
import { WeaknessEngine } from "./planner/WeaknessEngine";
import { WeeklyTracker } from "./planner/WeeklyTracker";

export function PlannerApp() {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
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

  useEffect(() => {
    const account = readSavedAccount();
    if (account) {
      setCurrentUser(account);
      setPlannerState(readUserProgress(account.username));
      setHasLoadedProgress(true);
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (currentUser && hasLoadedProgress) {
      saveUserProgress(currentUser.username, plannerState);
    }
  }, [currentUser, hasLoadedProgress, plannerState]);

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
    const normalizedUsername = loginUsername.trim().toUpperCase();
    const account = accounts.find(
      (item) => item.username === normalizedUsername && item.password === loginPassword
    );
    if (!account) {
      setLoginError("Invalid username or password");
      return;
    }
    setLoginError("");
    setLoginUsername("");
    setLoginPassword("");
    setCurrentUser(account);
    setPlannerState(readUserProgress(account.username));
    setHasLoadedProgress(true);
    saveSession(account.username);
  }

  function handleLogout() {
    clearSession();
    setCurrentUser(null);
    setHasLoadedProgress(false);
    setPlannerState(createInitialPlannerState());
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

  if (!isAuthReady) {
    return <main className="loginShell" />;
  }

  if (!currentUser) {
    return (
      <LoginPanel
        username={loginUsername}
        password={loginPassword}
        error={loginError}
        onUsernameChange={setLoginUsername}
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
      </section>

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

      {activeTab === "dashboard" && <DashboardView state={plannerState} />}
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
      {activeTab === "calendar" && <PhaseCalendar plannerData={plannerData} edits={plannerState.rowEdits} phaseFilter={phase} />}
      {activeTab === "plan" && (
        <DaywiseTable rows={filteredRows} edits={plannerState.rowEdits} totalRows={metrics.total} onUpdateRow={updateRow} />
      )}
      {activeTab === "weeks" && <WeeklyTracker plannerData={plannerData} edits={plannerState.rowEdits} />}
      {activeTab === "syllabus-map" && <SyllabusMap syllabus={plannerData.syllabus} />}
    </main>
  );
}

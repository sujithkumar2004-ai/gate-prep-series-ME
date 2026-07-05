"use client";

import { BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Flame, Server } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { accounts, sessionStorageKey, strategyCards } from "../config/appConfig";
import {
  computeMetrics,
  createInitialEdits,
  formatDate,
  plannerData,
  rowKey
} from "../lib/plannerData";
import { readUserProgress, saveUserProgress } from "../lib/progressStorage";
import type { Account, BackendStatus, RowEdit, Status, StoredState } from "../types/planner";
import { DaywiseTable } from "./planner/DaywiseTable";
import { LoginPanel } from "./planner/LoginPanel";
import { PhaseCalendar } from "./planner/PhaseCalendar";
import { PlannerHero } from "./planner/PlannerHero";
import { PlannerTabs, type PlannerTab } from "./planner/PlannerTabs";
import { PlannerToolbar } from "./planner/PlannerToolbar";
import { Metric } from "./planner/Shared";
import { SyllabusMap } from "./planner/SyllabusMap";
import { WeeklyTracker } from "./planner/WeeklyTracker";

export function PlannerApp() {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [edits, setEdits] = useState<StoredState>(() => createInitialEdits());
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("All");
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [activeTab, setActiveTab] = useState<PlannerTab>("calendar");
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(sessionStorageKey);
    const account = accounts.find((item) => item.username === savedUser);
    if (account) {
      setCurrentUser(account);
      setEdits(readUserProgress(account.username));
      setHasLoadedProgress(true);
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (currentUser && hasLoadedProgress) {
      saveUserProgress(currentUser.username, edits);
    }
  }, [currentUser, edits, hasLoadedProgress]);

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
      const edit = edits[rowKey(row)];
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
  }, [edits, phase, query, status, subject]);

  const metrics = useMemo(() => computeMetrics(edits), [edits]);

  const nextRow = useMemo(() => {
    return plannerData.days.find((row) => edits[rowKey(row)]?.status !== "Done") ?? plannerData.days[plannerData.days.length - 1];
  }, [edits]);

  function updateRow(key: string, patch: Partial<RowEdit>) {
    setEdits((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch
      }
    }));
  }

  function resetProgress() {
    setEdits(createInitialEdits());
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" });
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
    setEdits(readUserProgress(account.username));
    setHasLoadedProgress(true);
    window.localStorage.setItem(sessionStorageKey, account.username);
  }

  function handleLogout() {
    window.localStorage.removeItem(sessionStorageKey);
    setCurrentUser(null);
    setHasLoadedProgress(false);
    setEdits(createInitialEdits());
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

      {activeTab === "calendar" && <PhaseCalendar plannerData={plannerData} edits={edits} phaseFilter={phase} />}
      {activeTab === "plan" && (
        <DaywiseTable rows={filteredRows} edits={edits} totalRows={metrics.total} onUpdateRow={updateRow} />
      )}
      {activeTab === "weeks" && <WeeklyTracker plannerData={plannerData} edits={edits} />}
      {activeTab === "syllabus" && <SyllabusMap syllabus={plannerData.syllabus} />}
    </main>
  );
}

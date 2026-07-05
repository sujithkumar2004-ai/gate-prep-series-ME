"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Dumbbell,
  Flame,
  LineChart,
  LockKeyhole,
  LogOut,
  NotebookPen,
  PiggyBank,
  RotateCcw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Target,
  TimerReset,
  UserRound,
  WalletCards
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { dailyScoreLabel } from "../config/examConfig";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { loginWithBackendFallback } from "../services/authService";
import {
  autoBacklog,
  createInitialState,
  dailyScore,
  emergencyMode,
  examDate,
  formatDate,
  mockTrend,
  plannerData,
  planStartDate,
  readinessScore,
  spacedRevisionSchedule,
  statuses,
  subjectCompletion,
  syllabusCompletionDate,
  topicMastery,
  weakTopics
} from "../services/plannerService";
import { loadProgress, saveProgress } from "../services/progressService";
import type {
  AuthSession,
  DailyProgress,
  Expense,
  MistakeRecord,
  MockTestRecord,
  PlannerDay,
  PlannerState,
  ProgressStatus
} from "../types/planner";

type BackendStatus = {
  status: "connected";
  totalDays: number;
  dailyWorkItems: number;
  sourceOfTruth: string;
  rule: string;
};

type TabId =
  | "dashboard"
  | "daily"
  | "syllabus"
  | "pyq"
  | "mocks"
  | "weakness"
  | "mistakes"
  | "backlog"
  | "revision"
  | "formula"
  | "analytics"
  | "money"
  | "gym"
  | "war"
  | "settings";

const sessionStorageKey = "gate-me-planner-session-v5";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
  { id: "daily", label: "Daily Plan", icon: <CalendarDays size={16} /> },
  { id: "syllabus", label: "Syllabus Tracker", icon: <BookOpen size={16} /> },
  { id: "pyq", label: "PYQ Tracker", icon: <ClipboardList size={16} /> },
  { id: "mocks", label: "Mock Test Analysis", icon: <LineChart size={16} /> },
  { id: "weakness", label: "Weakness Engine", icon: <Brain size={16} /> },
  { id: "mistakes", label: "Mistake Notebook", icon: <NotebookPen size={16} /> },
  { id: "backlog", label: "Backlog Recovery", icon: <TimerReset size={16} /> },
  { id: "revision", label: "Revision System", icon: <RotateCcw size={16} /> },
  { id: "formula", label: "Formula Book", icon: <ShieldCheck size={16} /> },
  { id: "analytics", label: "Analytics", icon: <Activity size={16} /> },
  { id: "money", label: "Salary + Expense", icon: <WalletCards size={16} /> },
  { id: "gym", label: "Gym Routine", icon: <Dumbbell size={16} /> },
  { id: "war", label: "Exam War Room", icon: <Flame size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> }
];

const statusClass: Record<ProgressStatus, string> = {
  "Not Started": "statusNotStarted",
  "In Progress": "statusInProgress",
  Done: "statusDone",
  Backlog: "statusBacklog"
};

const strategyCards = [
  {
    label: "99 Percentile System",
    text: "Every day must end with concept clarity, timed questions, PYQ work, mistake review, and recall."
  },
  {
    label: "Topper Pattern",
    text: "Toppers usually protect accuracy, revise short notes often, analyze mocks deeply, and repeat PYQs until patterns become automatic."
  },
  {
    label: "January Rule",
    text: "No new syllabus in January. Only mocks, analysis, speed drills, revision, weakness repair, and exam strategy."
  }
];

function defaultProgress(day: PlannerDay): DailyProgress {
  return (
    createInitialState().dailyProgress[day.id] ?? {
      status: "Not Started",
      actualMinutes: 0,
      actualHours: 0,
      conceptDone: false,
      notesDone: false,
      pyqSolved: 0,
      pyqAccuracy: 0,
      mockAnalysisDone: false,
      revisionDone: false,
      workItems: day.workItems.map(() => ({ done: false })),
      skipReason: "",
      notes: ""
    }
  );
}

function scoreClass(value: number) {
  if (value >= 80) return "scoreStrong";
  if (value >= 55) return "scoreMedium";
  return "scoreWeak";
}

function patchDailyProgress(
  state: PlannerState,
  day: PlannerDay,
  patch: Partial<DailyProgress>
): PlannerState {
  const current = state.dailyProgress[day.id] ?? defaultProgress(day);
  return {
    ...state,
    dailyProgress: {
      ...state.dailyProgress,
      [day.id]: {
        ...current,
        ...patch
      }
    }
  };
}

export default function PlannerPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [plannerState, setPlannerState] = useState<PlannerState>(() => createInitialState());
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(sessionStorageKey);
    if (!saved) {
      setIsAuthReady(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as AuthSession;
      setSession(parsed);
      loadProgress(parsed.user.id, parsed.token).then((state) => {
        setPlannerState(state);
        setHasLoadedProgress(true);
      });
    } catch {
      window.localStorage.removeItem(sessionStorageKey);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/planner")
      .then((response) => response.json())
      .then((data: BackendStatus) => setBackendStatus(data))
      .catch(() => setBackendStatus(null));
  }, []);

  useEffect(() => {
    if (session && hasLoadedProgress) {
      saveProgress(session.user.id, session.token, plannerState);
    }
  }, [hasLoadedProgress, plannerState, session]);

  const subjects = useMemo(
    () => ["All", ...Array.from(new Set(plannerData.daywisePlan.map((day) => day.subject)))],
    []
  );

  const filteredDays = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return plannerData.daywisePlan.filter((day) => {
      const text = [day.subject, day.topic, day.task, day.workItems.join(" "), day.phase, day.week].join(" ").toLowerCase();
      return (!needle || text.includes(needle)) && (subjectFilter === "All" || day.subject === subjectFilter);
    });
  }, [debouncedQuery, subjectFilter]);

  const metrics = useMemo(() => {
    const total = plannerData.daywisePlan.length;
    const done = plannerData.daywisePlan.filter((day) => plannerState.dailyProgress[day.id]?.status === "Done").length;
    const backlog = plannerData.daywisePlan.filter((day) => plannerState.dailyProgress[day.id]?.status === "Backlog").length;
    const pyqSolved = plannerData.daywisePlan.reduce(
      (sum, day) => sum + (plannerState.dailyProgress[day.id]?.pyqSolved ?? 0),
      0
    );
    const pyqTarget = plannerData.daywisePlan.reduce((sum, day) => sum + day.pyqTarget, 0);
    const dailyAverage = Math.round(
      plannerData.daywisePlan.reduce((sum, day) => sum + dailyScore(day, plannerState.dailyProgress[day.id] ?? defaultProgress(day)), 0) /
        Math.max(total, 1)
    );
    return {
      total,
      done,
      backlog,
      pyqSolved,
      pyqTarget,
      completion: Math.round((done / total) * 100),
      readiness: readinessScore(plannerState),
      dailyAverage
    };
  }, [plannerState]);

  const subjectRows = useMemo(() => subjectCompletion(plannerState), [plannerState]);
  const masteryRows = useMemo(() => topicMastery(plannerState), [plannerState]);
  const weakRows = useMemo(() => weakTopics(plannerState), [plannerState]);
  const backlogRows = useMemo(() => [...autoBacklog(plannerState), ...plannerState.backlog], [plannerState]);
  const revisionRows = useMemo(() => spacedRevisionSchedule(plannerState).slice(0, 80), [plannerState]);
  const mockRows = useMemo(() => Object.values(plannerState.mockTests), [plannerState.mockTests]);
  const mockTrendRows = useMemo(() => mockTrend(plannerState), [plannerState]);
  const currentMode = useMemo(() => emergencyMode(plannerState), [plannerState]);

  const nextDay =
    plannerData.daywisePlan.find((day) => plannerState.dailyProgress[day.id]?.status !== "Done") ??
    plannerData.daywisePlan[plannerData.daywisePlan.length - 1];

  function updateDay(day: PlannerDay, patch: Partial<DailyProgress>) {
    setPlannerState((current) => patchDailyProgress(current, day, patch));
  }

  function toggleWorkItem(day: PlannerDay, index: number) {
    const progress = plannerState.dailyProgress[day.id] ?? defaultProgress(day);
    const workItems = progress.workItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, done: !item.done } : item
    );
    updateDay(day, { workItems });
  }

  function updateMock(id: string, patch: Partial<MockTestRecord>) {
    setPlannerState((current) => ({
      ...current,
      mockTests: {
        ...current.mockTests,
        [id]: {
          ...current.mockTests[id],
          ...patch
        }
      }
    }));
  }

  function addExpense(expense: Expense) {
    setPlannerState((current) => ({ ...current, expenses: [...current.expenses, expense] }));
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const nextSession = await loginWithBackendFallback({ username: loginUsername, password: loginPassword });
      const state = await loadProgress(nextSession.user.id, nextSession.token);
      setSession(nextSession);
      setPlannerState(state);
      setHasLoadedProgress(true);
      setLoginError("");
      setLoginUsername("");
      setLoginPassword("");
      window.localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(sessionStorageKey);
    setSession(null);
    setPlannerState(createInitialState());
    setHasLoadedProgress(false);
  }

  function resetProgress() {
    setPlannerState(createInitialState());
    setShowResetConfirm(false);
  }

  if (!isAuthReady) {
    return <main className="loginShell" />;
  }

  if (!session) {
    return (
      <main className="loginShell">
        <section className="loginPanel" aria-label="Login">
          <div className="loginBrand">
            <p className="eyebrow">GATE ME 2027</p>
            <h1>Exam Clearance Planner</h1>
            <p>Backend-ready planner with local fallback, syllabus lock, mocks, weaknesses, money, and gym discipline.</p>
          </div>
          <form className="loginCard" onSubmit={handleLogin}>
            <div className="loginIcon">
              <LockKeyhole size={24} />
            </div>
            <h2>Login</h2>
            <label>
              <span>Username</span>
              <div>
                <UserRound size={18} />
                <input
                  value={loginUsername}
                  onChange={(event) => setLoginUsername(event.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
            </label>
            <label>
              <span>Password</span>
              <div>
                <LockKeyhole size={18} />
                <input
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </label>
            {loginError && <p className="loginError">{loginError}</p>}
            <button type="submit">Sign In</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero compactHero">
        <div>
          <p className="eyebrow">GATE ME 2027</p>
          <h1>Exam Clearance Planner</h1>
          <p className="heroCopy">
            One source of truth, syllabus lock by {formatDate(syllabusCompletionDate)}, January-only mocks and revision,
            and final exam day on {formatDate(examDate)}.
          </p>
          <div className="dateRibbon" aria-label="Plan dates">
            <span>Starts {formatDate(planStartDate)}</span>
            <span>Syllabus lock {formatDate(syllabusCompletionDate)}</span>
            <span>Next {formatDate(nextDay.date)}</span>
            <span>Exam {formatDate(examDate)}</span>
          </div>
        </div>
        <div className="heroPanel" aria-label="Overall readiness">
          <div className="accountPill">
            <UserRound size={16} />
            <span>{session.user.displayName}</span>
          </div>
          <span>{metrics.readiness}%</span>
          <p>readiness</p>
          <div className="progressTrack">
            <div style={{ width: `${metrics.readiness}%` }} />
          </div>
          <button className="logoutButton" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>

      <section className="metricGrid" aria-label="Planner summary">
        <Metric icon={<Target />} label="Readiness" value={`${metrics.readiness}%`} />
        <Metric icon={<CheckCircle2 />} label="Syllabus" value={`${metrics.completion}%`} />
        <Metric icon={<ClipboardList />} label="PYQs" value={`${metrics.pyqSolved}/${metrics.pyqTarget}`} />
        <Metric icon={<AlertTriangle />} label="Backlog" value={metrics.backlog.toString()} />
        <Metric icon={<Activity />} label="Daily Avg" value={`${metrics.dailyAverage}/100`} />
        <Metric icon={<ShieldCheck />} label="Mode" value={currentMode} />
        <Metric icon={<Server />} label="Backend" value={backendStatus?.status === "connected" ? "Connected" : "Fallback"} />
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

      <section className="toolbar cleanToolbar" aria-label="Planner controls">
        <label className="searchBox">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subjects, topics, work items"
          />
        </label>
        <Select label="Subject" value={subjectFilter} onChange={setSubjectFilter} options={subjects} />
        <button className="iconTextButton" onClick={() => setShowResetConfirm(true)}>
          <RotateCcw size={17} />
          Reset
        </button>
      </section>

      <nav className="tabs megaTabs" aria-label="Planner views">
        {tabs.map((tab) => (
          <button className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} key={tab.id}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "dashboard" && (
        <section className="contentGrid">
          <Panel title="Today Score" icon={<Activity />}>
            <div className={`bigScore ${scoreClass(dailyScore(nextDay, plannerState.dailyProgress[nextDay.id] ?? defaultProgress(nextDay)))}`}>
              {dailyScore(nextDay, plannerState.dailyProgress[nextDay.id] ?? defaultProgress(nextDay))}/100
            </div>
            <p className="scoreLabel">{dailyScoreLabel(dailyScore(nextDay, plannerState.dailyProgress[nextDay.id] ?? defaultProgress(nextDay)))}</p>
            <p className="panelText">{nextDay.task}</p>
            <ul className="checkList">
              {nextDay.workItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="Readiness Formula" icon={<Target />}>
            <p className="panelText">{plannerData.intelligenceRules.readinessScore}</p>
            <div className="readinessBar">
              <span style={{ width: `${metrics.readiness}%` }} />
            </div>
          </Panel>
          <Panel title="Mock Trend" icon={<LineChart />}>
            <TrendList rows={mockTrendRows} />
          </Panel>
          <Panel title="Critical Weak Topics" icon={<Brain />}>
            <CompactList rows={weakRows.map((row) => `${row.subject}: ${row.topic}`)} empty="No weak topics detected yet." />
          </Panel>
          <Panel title="Current Mode" icon={<ShieldCheck />}>
            <div className="bigScore modeScore">{currentMode}</div>
            <p className="panelText">Backlog &gt; 3 triggers Backlog Mode, backlog &gt; 7 triggers Crash Mode, and after Dec 31 the app enters Mock-Only Mode.</p>
          </Panel>
        </section>
      )}

      {activeTab === "daily" && (
        <section className="sheetWrap">
          <div className="sheetInfo">Showing {filteredDays.length} of {plannerData.daywisePlan.length} days</div>
          <div className="tableScroll">
            <table className="plannerTable premiumTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Task</th>
                  <th>Work Items</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Minutes</th>
                  <th>PYQ</th>
                  <th>Accuracy</th>
                  <th>Skip Reason</th>
                  <th>Revision</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredDays.map((day) => {
                  const progress = plannerState.dailyProgress[day.id] ?? defaultProgress(day);
                  return (
                    <tr key={day.id}>
                      <td className="dateCell">{formatDate(day.date)}</td>
                      <td className="subjectCell">{day.subject}</td>
                      <td className="topicCell">{day.task}</td>
                      <td className="workCell">
                        {day.workItems.map((item, index) => (
                          <label className="workCheck" key={item}>
                            <input
                              type="checkbox"
                              checked={progress.workItems[index]?.done ?? false}
                              onChange={() => toggleWorkItem(day, index)}
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </td>
                      <td>
                        <span className={`scorePill ${scoreClass(dailyScore(day, progress))}`}>{dailyScore(day, progress)}</span>
                      </td>
                      <td>
                        <select
                          className={`statusSelect ${statusClass[progress.status]}`}
                          value={progress.status}
                          onChange={(event) => updateDay(day, { status: event.target.value as ProgressStatus })}
                        >
                          {statuses.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="hourInput"
                          type="number"
                          min="0"
                          step="0.5"
                          value={progress.actualHours || ""}
                          onChange={(event) => updateDay(day, { actualHours: Number(event.target.value) })}
                        />
                      </td>
                      <td>
                        <input
                          className="hourInput"
                          type="number"
                          min="0"
                          value={progress.actualMinutes || ""}
                          onChange={(event) => updateDay(day, { actualMinutes: Number(event.target.value) })}
                        />
                      </td>
                      <td>
                        <input
                          className="hourInput"
                          type="number"
                          min="0"
                          value={progress.pyqSolved || ""}
                          onChange={(event) => updateDay(day, { pyqSolved: Number(event.target.value) })}
                        />
                      </td>
                      <td>
                        <input
                          className="hourInput"
                          type="number"
                          min="0"
                          max="100"
                          value={progress.pyqAccuracy || ""}
                          onChange={(event) => updateDay(day, { pyqAccuracy: Number(event.target.value) })}
                        />
                      </td>
                      <td>
                        <textarea
                          value={progress.skipReason}
                          onChange={(event) => updateDay(day, { skipReason: event.target.value })}
                          placeholder="Required if skipped"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={progress.revisionDone}
                          onChange={(event) => updateDay(day, { revisionDone: event.target.checked })}
                        />
                      </td>
                      <td>
                        <textarea
                          value={progress.notes}
                          onChange={(event) => updateDay(day, { notes: event.target.value })}
                          placeholder="Mistake, formula, backlog reason"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "syllabus" && (
        <section className="syllabusGrid">
          {subjectRows.map((row) => (
            <article className="syllabusCard" key={row.id}>
              <p>{row.section}</p>
              <h3>{row.subject}</h3>
              <div className="miniTrack">
                <div style={{ width: `${row.completion}%` }} />
              </div>
              <strong>{row.completion}% complete</strong>
              <ul>
                {row.topics.map((topic) => (
                  <li key={topic.id}>{topic.title}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      {activeTab === "pyq" && (
        <section className="contentGrid">
          <Panel title="PYQ Completion" icon={<ClipboardList />}>
            <div className="bigScore">{metrics.pyqSolved}/{metrics.pyqTarget}</div>
            <p className="panelText">Target includes topic PYQs, deep PYQ days, mocks, and January speed drills.</p>
          </Panel>
          <Panel title="Top PYQ Subjects" icon={<BookOpen />}>
            <CompactList
              rows={masteryRows
                .sort((a, b) => b.pyqSolved - a.pyqSolved)
                .slice(0, 10)
                .map((row) => `${row.subject}: ${row.pyqSolved} solved`)}
            />
          </Panel>
        </section>
      )}

      {activeTab === "mocks" && (
        <section className="sheetWrap">
          <div className="tableScroll">
            <table className="plannerTable compactTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mock</th>
                  <th>Target</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Wrong</th>
                  <th>Analysis</th>
                  <th>Weakness Notes</th>
                </tr>
              </thead>
              <tbody>
                {mockRows.map((mock) => (
                  <tr key={mock.id}>
                    <td>{formatDate(mock.date)}</td>
                    <td>{mock.name}</td>
                    <td>{mock.targetScore}</td>
                    <td>
                      <input className="hourInput" value={mock.score ?? ""} onChange={(event) => updateMock(mock.id, { score: Number(event.target.value) })} />
                    </td>
                    <td>
                      <input className="hourInput" value={mock.accuracy ?? ""} onChange={(event) => updateMock(mock.id, { accuracy: Number(event.target.value) })} />
                    </td>
                    <td>
                      <input className="hourInput" value={mock.wrong ?? ""} onChange={(event) => updateMock(mock.id, { wrong: Number(event.target.value) })} />
                    </td>
                    <td>
                      <input type="checkbox" checked={mock.analysisDone ?? false} onChange={(event) => updateMock(mock.id, { analysisDone: event.target.checked })} />
                    </td>
                    <td>
                      <textarea value={mock.weaknessNotes ?? ""} onChange={(event) => updateMock(mock.id, { weaknessNotes: event.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "weakness" && (
        <section className="contentGrid">
          <Panel title="Detected Weak Topics" icon={<Brain />}>
            <CompactList rows={weakRows.map((row) => `${row.subject}: ${row.topic} (${row.backlogDays} backlog)`)} empty="No weak topics yet." />
          </Panel>
          <Panel title="Mistake Classification" icon={<AlertTriangle />}>
            <MistakeList mistakes={plannerState.mistakes} />
          </Panel>
        </section>
      )}

      {activeTab === "mistakes" && (
        <section className="contentGrid">
          <Panel title="Mistake Notebook" icon={<NotebookPen />}>
            <MistakeList mistakes={plannerState.mistakes} />
          </Panel>
          <Panel title="Mistake Categories" icon={<AlertTriangle />}>
            <CompactList rows={plannerData.seedData.mistakeCategories} />
          </Panel>
        </section>
      )}

      {activeTab === "backlog" && (
        <section className="contentGrid">
          <Panel title="Auto Backlog Recovery" icon={<TimerReset />}>
            <CompactList rows={backlogRows.map((row) => `${formatDate(row.date)} ${row.subject}: recover by ${formatDate(row.recoveryDate)}`)} empty="No backlog scheduled." />
          </Panel>
          <Panel title="Recovery Rule" icon={<ShieldCheck />}>
            <p className="panelText">Backlog is automatically detected from daily status and routed into recovery slots with the exact topic and reason.</p>
          </Panel>
        </section>
      )}

      {activeTab === "revision" && (
        <section className="contentGrid">
          <Panel title="Spaced Revision Queue" icon={<RotateCcw />}>
            <CompactList rows={revisionRows.map((row) => `${formatDate(row.revisionDate)}: ${row.subject} (${row.offsetDays}d)`)} empty="Mark days Done to generate spaced revisions." />
          </Panel>
          <Panel title="Revision Offsets" icon={<CalendarDays />}>
            <CompactList rows={plannerData.intelligenceRules.spacedRevisionOffsets.map((offset) => `Revise after ${offset} day(s)`).map(String)} />
          </Panel>
        </section>
      )}

      {activeTab === "formula" && (
        <section className="syllabusGrid">
          {subjectRows.map((row) => (
            <article className="syllabusCard" key={row.id}>
              <p>Formula Book</p>
              <h3>{row.subject}</h3>
              <ul>
                {row.topics.slice(0, 5).map((topic) => (
                  <li key={topic.id}>{topic.title}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      {activeTab === "analytics" && (
        <section className="contentGrid">
          <Panel title="Subject-wise Completion" icon={<BarChart3 />}>
            <CompactList rows={subjectRows.map((row) => `${row.subject}: ${row.completion}%`)} />
          </Panel>
          <Panel title="Topic Mastery" icon={<Brain />}>
            <CompactList rows={masteryRows.slice(0, 12).map((row) => `${row.mastery}: ${row.subject} - ${row.topic}`)} />
          </Panel>
          <Panel title="Daily Score Trend" icon={<Activity />}>
            <CompactList rows={plannerData.daywisePlan.slice(0, 10).map((day) => `${formatDate(day.date)}: ${dailyScore(day, plannerState.dailyProgress[day.id] ?? defaultProgress(day))}/100`)} />
          </Panel>
          <Panel title="Weak Topic Heatmap" icon={<AlertTriangle />}>
            <CompactList rows={weakRows.map((row) => `${row.subject}: ${row.backlogDays} backlog day(s)`)} empty="No heatmap pressure yet." />
          </Panel>
        </section>
      )}

      {activeTab === "money" && (
        <section className="contentGrid">
          <Panel title="Salary Plan" icon={<PiggyBank />}>
            <label className="fieldLine">
              Monthly salary
              <input
                type="number"
                value={plannerState.salary.monthlySalary || ""}
                onChange={(event) =>
                  setPlannerState((current) => ({
                    ...current,
                    salary: { ...current.salary, monthlySalary: Number(event.target.value) }
                  }))
                }
              />
            </label>
            <label className="fieldLine">
              Savings goal
              <input
                type="number"
                value={plannerState.salary.savingsGoal || ""}
                onChange={(event) =>
                  setPlannerState((current) => ({
                    ...current,
                    salary: { ...current.salary, savingsGoal: Number(event.target.value) }
                  }))
                }
              />
            </label>
          </Panel>
          <Panel title="Expenses" icon={<CreditCard />}>
            <CompactList rows={plannerState.expenses.map((expense) => `${expense.label}: ${expense.amount}`)} empty="No expenses added yet." />
            <button
              className="iconTextButton"
              onClick={() =>
                addExpense({ id: `expense-${Date.now()}`, label: "Study expense", amount: 0, category: "Study" })
              }
            >
              Add Expense
            </button>
          </Panel>
        </section>
      )}

      {activeTab === "gym" && (
        <section className="contentGrid">
          <Panel title="Gym Routine" icon={<Dumbbell />}>
            <p className="panelText">{plannerState.gymRoutine.weeklyGoal}</p>
            <CompactList rows={plannerState.gymRoutine.sessions.map((session) => `${session.day}: ${session.focus} (${session.durationMinutes} min)`)} />
          </Panel>
          <Panel title="Energy Rule" icon={<Activity />}>
            <p className="panelText">Gym supports consistency. Keep workouts short near mock days and protect sleep before full-length tests.</p>
          </Panel>
        </section>
      )}

      {activeTab === "war" && (
        <section className="contentGrid">
          <Panel title="Exam War Room" icon={<Flame />}>
            <div className={`bigScore ${scoreClass(metrics.readiness)}`}>{metrics.readiness}%</div>
            <p className="panelText">Exam day: {formatDate(examDate)}. Last week is light revision, formula recall, calculator rhythm, and sleep discipline.</p>
          </Panel>
          <Panel title="Final Rules" icon={<ShieldCheck />}>
            <CompactList
              rows={[
                "No new topics after Dec 31.",
                "Every mock must be analyzed before the next mock.",
                "Wrong MCQ accuracy matters because negative marking exists.",
                "Formula sheet and mistake notebook are daily assets.",
                "Sleep, food, and calm matter in the final week."
              ]}
            />
          </Panel>
        </section>
      )}

      {activeTab === "settings" && (
        <section className="contentGrid">
          <Panel title="Source of Truth" icon={<Server />}>
            <p className="panelText">{plannerData.metadata.sourceOfTruth}</p>
            <p className="panelText">{plannerData.metadata.rule}</p>
          </Panel>
          <Panel title="Export Options" icon={<ClipboardList />}>
            <CompactList
              rows={[
                "Export full planner as PDF: backend hook ready",
                "Export syllabus tracker as CSV: backend hook ready",
                "Export mock analysis as PDF: backend hook ready",
                "Export mistake notebook as CSV: backend hook ready",
                "Export daily report as PDF: backend hook ready"
              ]}
            />
          </Panel>
          <Panel title="Danger Zone" icon={<AlertTriangle />}>
            <button className="iconTextButton" onClick={() => setShowResetConfirm(true)}>
              Reset local fallback progress
            </button>
          </Panel>
        </section>
      )}

      {showResetConfirm && (
        <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label="Confirm reset">
          <div className="confirmModal">
            <h2>Reset progress?</h2>
            <p>This clears local fallback progress for this account. Backend persistence can replace this later.</p>
            <div>
              <button className="iconTextButton dangerAction" onClick={resetProgress}>Reset</button>
              <button className="iconTextButton" onClick={() => setShowResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="metricCard">
      <div>{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="selectBox">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="panelCard">
      <div className="panelHead">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </article>
  );
}

function CompactList({ rows, empty }: { rows: string[]; empty?: string }) {
  if (!rows.length) {
    return <p className="panelText">{empty ?? "No rows yet."}</p>;
  }
  return (
    <ul className="compactList">
      {rows.map((row) => (
        <li key={row}>{row}</li>
      ))}
    </ul>
  );
}

function TrendList({ rows }: { rows: MockTestRecord[] }) {
  if (!rows.length) {
    return <p className="panelText">Enter mock scores to build a trend.</p>;
  }
  return <CompactList rows={rows.map((row) => `${formatDate(row.date)}: ${row.score} marks`)} />;
}

function MistakeList({ mistakes }: { mistakes: MistakeRecord[] }) {
  if (!mistakes.length) {
    return <p className="panelText">Mistakes are captured from notes and mock analysis once you start marking progress.</p>;
  }
  return (
    <CompactList
      rows={mistakes.map(
        (mistake) =>
          `${mistake.type}: ${mistake.subject} / ${mistake.topic} - ${mistake.correctMethod} (retry ${formatDate(mistake.retryDate)}, ${mistake.fixed ? "fixed" : "open"})`
      )}
    />
  );
}

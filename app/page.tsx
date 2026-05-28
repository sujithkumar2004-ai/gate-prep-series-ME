"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  LockKeyhole,
  LogOut,
  RotateCcw,
  Search,
  Table2,
  UserRound
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import htmlPlan from "../src/data/htmlPlan.json";
import excelData from "../src/data/planner.json";

type Status = "Not Started" | "In Progress" | "Done" | "Backlog";

type HtmlDay = {
  date: string;
  sub: string;
  hours: string;
};

type HtmlWeek = {
  label: string;
  days: HtmlDay[];
};

type HtmlPhase = {
  id: number;
  title: string;
  dates: string;
  duration: string;
  goal: string;
  weeks: HtmlWeek[];
};

type DayRow = {
  Date: string;
  Day: string;
  Phase: string;
  PhaseId: number;
  Week: string;
  "Main Subject": string;
  Topic: string;
  "Daily Task": string;
  "Target Hours": number;
  Status: Status;
  Notes: string | null;
  Kind: "Study" | "Rest" | "Exam";
};

type SyllabusRow = {
  Section: string;
  Subject: string;
  "Topics Included": string;
};

type RowEdit = {
  status: Status;
  notes: string;
  actualHours: number;
};

type StoredState = Record<string, RowEdit>;
type Account = {
  username: string;
  password: string;
  name: string;
};

const phaseData = (htmlPlan as { phases: HtmlPhase[] }).phases;
const syllabusRows = (excelData as { "Syllabus Map": SyllabusRow[] })["Syllabus Map"];
const sessionStorageKey = "gate-me-planner-current-user-v1";
const storageKeyPrefix = "gate-me-html-planner-progress-v2";
const statuses: Status[] = ["Not Started", "In Progress", "Done", "Backlog"];
const accounts: Account[] = [
  { username: "SK001", password: "SK001@123", name: "SK001" },
  { username: "AR001", password: "AR001@123", name: "AR001" }
];

const phaseColors: Record<number, string> = {
  1: "#2c9a74",
  2: "#397fbd",
  3: "#766bd1",
  4: "#bd7414",
  5: "#c44b45"
};

const phaseSoftColors: Record<number, string> = {
  1: "#e1f5ee",
  2: "#e6f1fb",
  3: "#eeedfe",
  4: "#faeeda",
  5: "#fcebeb"
};

const statusClass: Record<Status, string> = {
  "Not Started": "statusNotStarted",
  "In Progress": "statusInProgress",
  Done: "statusDone",
  Backlog: "statusBacklog"
};

function toIsoDate(value: string) {
  const [month, rawDay] = value.split(" ");
  const year = month === "Jan" || month === "Feb" ? 2027 : 2026;
  const monthMap: Record<string, string> = {
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
    Jan: "01",
    Feb: "02"
  };
  return `${year}-${monthMap[month]}-${rawDay.padStart(2, "0")}`;
}

function parseSubjectAndTopic(text: string) {
  if (text.includes(":")) {
    const [subject, ...topic] = text.split(":");
    return { subject: subject.trim(), topic: topic.join(":").trim() };
  }
  if (text.startsWith("REST")) {
    return { subject: "Rest / Review", topic: text.replace(/^REST\s*—?\s*/i, "") || "Rest" };
  }
  if (text.includes("mock") || text.includes("Mock")) {
    return { subject: "Mock Test", topic: text };
  }
  if (text.includes("PYQ")) {
    return { subject: "PYQ Practice", topic: text };
  }
  if (text.includes("GATE EXAM")) {
    return { subject: "Exam Day", topic: text };
  }
  return { subject: "Revision", topic: text };
}

function parseHours(value: string) {
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function buildRows() {
  return phaseData.flatMap((phase) =>
    phase.weeks.flatMap((week) =>
      week.days
        .filter((day) => day.date && day.date !== "n/a")
        .map<DayRow>((day) => {
          const date = toIsoDate(day.date);
          const parsed = parseSubjectAndTopic(day.sub);
          const kind = day.hours === "Exam" ? "Exam" : /^REST/i.test(day.sub) ? "Rest" : "Study";
          return {
            Date: date,
            Day: new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(new Date(`${date}T00:00:00`)),
            Phase: phase.title,
            PhaseId: phase.id,
            Week: week.label,
            "Main Subject": parsed.subject,
            Topic: parsed.topic,
            "Daily Task": day.sub,
            "Target Hours": parseHours(day.hours),
            Status: "Not Started",
            Notes: null,
            Kind: kind
          };
        })
    )
  );
}

const dayRows = buildRows();

function rowKey(row: DayRow) {
  return `${row.Date}-${row["Daily Task"]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function getInitialEdits(): StoredState {
  return dayRows.reduce<StoredState>((acc, row) => {
    acc[rowKey(row)] = {
      status: row.Status,
      notes: row.Notes ?? "",
      actualHours: 0
    };
    return acc;
  }, {});
}

function storageKeyFor(username: string) {
  return `${storageKeyPrefix}-${username}`;
}

function readUserProgress(username: string) {
  const saved = window.localStorage.getItem(storageKeyFor(username));
  if (!saved) {
    return getInitialEdits();
  }
  try {
    return { ...getInitialEdits(), ...JSON.parse(saved) };
  } catch {
    return getInitialEdits();
  }
}

export default function PlannerPage() {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [edits, setEdits] = useState<StoredState>(() => getInitialEdits());
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("All");
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [activeTab, setActiveTab] = useState<"calendar" | "plan" | "weeks" | "syllabus">("calendar");
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

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
      window.localStorage.setItem(storageKeyFor(currentUser.username), JSON.stringify(edits));
    }
  }, [currentUser, edits, hasLoadedProgress]);

  const phases = useMemo(() => ["All", ...phaseData.map((item) => item.title)], []);
  const subjects = useMemo(() => ["All", ...Array.from(new Set(dayRows.map((row) => row["Main Subject"])))], []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dayRows.filter((row) => {
      const edit = edits[rowKey(row)];
      const matchesQuery =
        !needle ||
        [row.Topic, row["Daily Task"], row["Main Subject"], row.Phase, row.Week]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return (
        matchesQuery &&
        (phase === "All" || row.Phase === phase) &&
        (subject === "All" || row["Main Subject"] === subject) &&
        (status === "All" || edit?.status === status)
      );
    });
  }, [edits, phase, query, status, subject]);

  const metrics = useMemo(() => {
    const counts = statuses.reduce<Record<Status, number>>((acc, item) => {
      acc[item] = 0;
      return acc;
    }, {} as Record<Status, number>);
    let actualHours = 0;
    let targetHours = 0;
    dayRows.forEach((row) => {
      const edit = edits[rowKey(row)];
      counts[edit?.status ?? row.Status] += 1;
      actualHours += Number(edit?.actualHours ?? 0);
      targetHours += Number(row["Target Hours"] ?? 0);
    });
    const studyDays = dayRows.filter((row) => row.Kind === "Study").length;
    const restDays = dayRows.filter((row) => row.Kind === "Rest").length;
    return {
      total: dayRows.length,
      studyDays,
      restDays,
      counts,
      targetHours,
      actualHours,
      completion: Math.round((counts.Done / dayRows.length) * 100)
    };
  }, [edits]);

  const weeklyRows = useMemo(() => {
    return phaseData.flatMap((phase) =>
      phase.weeks.map((week, index) => {
        const rows = dayRows.filter((row) => row.PhaseId === phase.id && row.Week === week.label);
        const done = rows.filter((row) => edits[rowKey(row)]?.status === "Done").length;
        const actual = rows.reduce((sum, row) => sum + Number(edits[rowKey(row)]?.actualHours ?? 0), 0);
        const target = rows.reduce((sum, row) => sum + row["Target Hours"], 0);
        return {
          id: `${phase.id}-${index}`,
          phase,
          label: week.label,
          start: rows[0]?.Date,
          end: rows[rows.length - 1]?.Date,
          done,
          total: rows.length,
          actual,
          target
        };
      })
    );
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
    setEdits(getInitialEdits());
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
    setEdits(getInitialEdits());
  }

  if (!isAuthReady) {
    return <main className="loginShell" />;
  }

  if (!currentUser) {
    return (
      <main className="loginShell">
        <section className="loginPanel" aria-label="Login">
          <div className="loginBrand">
            <p className="eyebrow">GATE ME 2027</p>
            <h1>Study Planner</h1>
            <p>Sign in to keep your planner progress separate on this device.</p>
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
      <section className="hero">
        <div>
          <p className="eyebrow">GATE ME 2027</p>
          <h1>Study Planner</h1>
          <p className="heroCopy">
            June 1, 2026 to February 1, 2027. Rebuilt from your HTML phase plan with a calendar view,
            Excel-style marking, weekly tracking, rest days, and exam-day visibility.
          </p>
        </div>
        <div className="heroPanel" aria-label="Overall completion">
          <div className="accountPill">
            <UserRound size={16} />
            <span>{currentUser.name}</span>
          </div>
          <span>{metrics.completion}%</span>
          <p>complete</p>
          <div className="progressTrack">
            <div style={{ width: `${metrics.completion}%` }} />
          </div>
          <button className="logoutButton" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>

      <section className="metricGrid" aria-label="Planner summary">
        <Metric icon={<CalendarDays />} label="Total Days" value={metrics.total.toString()} />
        <Metric icon={<BookOpen />} label="Study Days" value={metrics.studyDays.toString()} />
        <Metric icon={<ClipboardList />} label="Rest Days" value={metrics.restDays.toString()} />
        <Metric icon={<CheckCircle2 />} label="Done" value={metrics.counts.Done.toString()} />
        <Metric icon={<ClipboardList />} label="Backlog" value={metrics.counts.Backlog.toString()} />
        <Metric icon={<BarChart3 />} label="Hours" value={`${metrics.actualHours}/${metrics.targetHours}`} />
      </section>

      <section className="toolbar" aria-label="Planner controls">
        <label className="searchBox">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics, tasks, subjects"
          />
        </label>
        <Select label="Phase" value={phase} onChange={setPhase} options={phases} />
        <Select label="Subject" value={subject} onChange={setSubject} options={subjects} />
        <Select label="Status" value={status} onChange={(value) => setStatus(value as Status | "All")} options={["All", ...statuses]} />
        <button className="iconButton" onClick={exportProgress} title="Export progress">
          <Download size={18} />
        </button>
        <button className="iconButton danger" onClick={resetProgress} title="Reset progress">
          <RotateCcw size={18} />
        </button>
      </section>

      <nav className="tabs" aria-label="Planner views">
        <button className={activeTab === "calendar" ? "active" : ""} onClick={() => setActiveTab("calendar")}>
          <CalendarDays size={17} /> Phase Calendar
        </button>
        <button className={activeTab === "plan" ? "active" : ""} onClick={() => setActiveTab("plan")}>
          <Table2 size={17} /> Daywise Marking
        </button>
        <button className={activeTab === "weeks" ? "active" : ""} onClick={() => setActiveTab("weeks")}>
          <BarChart3 size={17} /> Weekly Tracker
        </button>
        <button className={activeTab === "syllabus" ? "active" : ""} onClick={() => setActiveTab("syllabus")}>
          <BookOpen size={17} /> Syllabus Map
        </button>
      </nav>

      {activeTab === "calendar" && (
        <section className="phaseStack" aria-label="Phase calendar">
          {phaseData
            .filter((item) => phase === "All" || item.title === phase)
            .map((item) => (
              <article className="phaseBlock" key={item.id}>
                <div className="phaseTop" style={{ background: phaseSoftColors[item.id] }}>
                  <div>
                    <span style={{ color: phaseColors[item.id] }}>{item.duration}</span>
                    <h2>{item.title}</h2>
                    <p>{item.goal}</p>
                  </div>
                  <strong>{item.dates}</strong>
                </div>
                <div className="weekdayHeader">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                {item.weeks.map((week) => (
                  <div className="calendarWeek" key={week.label}>
                    <p>{week.label}</p>
                    <div className="dayGrid">
                      {week.days.filter((day) => day.date && day.date !== "n/a").map((day, index) => {
                        const matchingRow = dayRows.find(
                          (row) => row.PhaseId === item.id && row.Week === week.label && row["Daily Task"] === day.sub
                        );
                        const edit = matchingRow ? edits[rowKey(matchingRow)] : undefined;
                        const isRest = /^REST/i.test(day.sub);
                        const isExam = day.hours === "Exam";
                        return (
                          <div
                            className={`dayCell ${isRest ? "restDay" : ""} ${isExam ? "examDay" : ""}`}
                            key={`${week.label}-${day.date}-${index}`}
                          >
                            <div className="dayNum" style={{ color: phaseColors[item.id] }}>{day.date}</div>
                            <div className="daySubject">{day.sub}</div>
                            <div className="dayFoot">
                              <span>{day.hours}</span>
                              {edit && <small className={statusClass[edit.status]}>{edit.status}</small>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </article>
            ))}
        </section>
      )}

      {activeTab === "plan" && (
        <section className="sheetWrap" aria-label="Daywise marking table">
          <div className="sheetInfo">
            Showing {filteredRows.length} of {metrics.total} rows
          </div>
          <div className="tableScroll">
            <table className="plannerTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Phase</th>
                  <th>Week</th>
                  <th>Subject</th>
                  <th>Task</th>
                  <th>Target</th>
                  <th>Kind</th>
                  <th>Status</th>
                  <th>Actual</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const key = rowKey(row);
                  const edit = edits[key];
                  return (
                    <tr key={key}>
                      <td className="dateCell">{formatDate(row.Date)}</td>
                      <td>{row.Day}</td>
                      <td>{row.Phase}</td>
                      <td>{row.Week}</td>
                      <td className="subjectCell">{row["Main Subject"]}</td>
                      <td className="topicCell">{row["Daily Task"]}</td>
                      <td className="numberCell">{row["Target Hours"]}</td>
                      <td>{row.Kind}</td>
                      <td>
                        <select
                          className={`statusSelect ${statusClass[edit?.status ?? row.Status]}`}
                          value={edit?.status ?? row.Status}
                          onChange={(event) => updateRow(key, { status: event.target.value as Status })}
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
                          value={edit?.actualHours || ""}
                          onChange={(event) => updateRow(key, { actualHours: Number(event.target.value) })}
                        />
                      </td>
                      <td>
                        <textarea
                          value={edit?.notes ?? ""}
                          onChange={(event) => updateRow(key, { notes: event.target.value })}
                          placeholder="Mistakes, backlog, formula notes"
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

      {activeTab === "weeks" && (
        <section className="weekGrid" aria-label="Weekly tracker">
          {weeklyRows.map((week) => {
            const completion = week.total ? Math.round((week.done / week.total) * 100) : 0;
            return (
              <article className="weekCard" key={week.id}>
                <div className="weekHead">
                  <span>{week.label}</span>
                  <strong>{completion}%</strong>
                </div>
                <p>{formatDate(week.start)} to {formatDate(week.end)}</p>
                <h3>{week.phase.title}</h3>
                <div className="miniTrack">
                  <div style={{ width: `${completion}%`, background: phaseColors[week.phase.id] }} />
                </div>
                <dl>
                  <div><dt>Target</dt><dd>{week.target}h</dd></div>
                  <div><dt>Actual</dt><dd>{week.actual}h</dd></div>
                  <div><dt>Done</dt><dd>{week.done}/{week.total}</dd></div>
                </dl>
              </article>
            );
          })}
        </section>
      )}

      {activeTab === "syllabus" && (
        <section className="syllabusGrid" aria-label="Syllabus map">
          {syllabusRows.map((row) => (
            <article className="syllabusCard" key={`${row.Section}-${row.Subject}`}>
              <p>{row.Section}</p>
              <h3>{row.Subject}</h3>
              <ul>
                {row["Topics Included"].split("\n").map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
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

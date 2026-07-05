"use client";

import { Download, RotateCcw, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { finalExamDate, formatDate, plannerData, syllabusLockDate } from "../../lib/plannerData";
import { validatePlannerData } from "../../lib/plannerValidation";
import { createBackup, restoreBackup, validateBackup } from "../../services/backupService";
import { downloadText, exportDailyProgressCsv, exportFullPlannerCsv, exportMistakeNotebookCsv, exportMockAnalysisCsv, exportSyllabusCsv } from "../../services/exportService";
import type { Account, PlannerState, SyncStatus } from "../../types/planner";

type ProductionSettingsProps = {
  state: PlannerState;
  currentUser: Account;
  syncStatus: SyncStatus;
  onRestore: (state: PlannerState) => void;
  onClearLocal: () => void;
};

const qaItems = [
  "build passes",
  "all tabs open",
  "login works",
  "logout works",
  "dashboard loads",
  "daily task complete works",
  "skip reason validation works",
  "revision creation works",
  "backlog creation works",
  "PYQ session save works",
  "mock test save works",
  "mistake save works",
  "deep work timer works",
  "active recall works",
  "energy log works",
  "gym log works",
  "export works",
  "backup works",
  "mobile layout works",
  "no UI overlap"
];

export function ProductionSettings({ state, currentUser, syncStatus, onRestore, onClearLocal }: ProductionSettingsProps) {
  const [backupText, setBackupText] = useState("");
  const [message, setMessage] = useState("");
  const validation = useMemo(() => validatePlannerData(plannerData), []);
  const fallbackEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_FALLBACK !== "false";

  function exportCsv(kind: "planner" | "syllabus" | "mocks" | "mistakes" | "daily") {
    const map = {
      planner: ["full-planner.csv", exportFullPlannerCsv(state)],
      syllabus: ["syllabus-tracker.csv", exportSyllabusCsv(state)],
      mocks: ["mock-analysis.csv", exportMockAnalysisCsv(state)],
      mistakes: ["mistake-notebook.csv", exportMistakeNotebookCsv(state)],
      daily: ["daily-progress.csv", exportDailyProgressCsv(state)]
    } as const;
    downloadText(map[kind][0], map[kind][1]);
  }

  function downloadBackup() {
    downloadText("exam-clearance-planner-backup.json", JSON.stringify(createBackup(state, currentUser), null, 2), "application/json;charset=utf-8");
  }

  function importBackup() {
    setMessage("");
    try {
      const parsed = JSON.parse(backupText) as unknown;
      const result = validateBackup(parsed);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (!window.confirm("Restore this backup? Current local progress will be replaced after confirmation.")) return;
      onRestore(restoreBackup(result.backup));
      setBackupText("");
      setMessage("Backup restored. Sync will run automatically.");
    } catch {
      setMessage("Backup JSON could not be parsed.");
    }
  }

  function clearLocal() {
    if (window.confirm("Clear local planner data for this browser? This cannot be undone.")) {
      onClearLocal();
      setMessage("Local planner data cleared.");
    }
  }

  return (
    <section className="coreStack">
      <article className="widePanel">
        <div className="panelTitle">
          <h2>Production Settings</h2>
          <span className="taskType">{syncStatus}</span>
        </div>
        <div className="metricGrid compactMetrics">
          <div className="metricCard"><span>Profile</span><strong>{currentUser.name}</strong><p>{currentUser.email}</p></div>
          <div className="metricCard"><span>Exam Date</span><strong>{formatDate(finalExamDate)}</strong><p>Locked final GATE ME date</p></div>
          <div className="metricCard"><span>Syllabus Lock</span><strong>{formatDate(syllabusLockDate)}</strong><p>January stays revision/mock focused</p></div>
          <div className="metricCard"><span>Fallback</span><strong>{fallbackEnabled ? "Enabled" : "Disabled"}</strong><p>API first, local fallback when configured</p></div>
        </div>
      </article>

      <article className="widePanel">
        <div className="panelTitle"><h2>CSV Export</h2><Download size={18} /></div>
        <div className="buttonGrid">
          <button className="iconTextButton" onClick={() => exportCsv("planner")}>Full planner CSV</button>
          <button className="iconTextButton" onClick={() => exportCsv("syllabus")}>Syllabus CSV</button>
          <button className="iconTextButton" onClick={() => exportCsv("mocks")}>Mock analysis CSV</button>
          <button className="iconTextButton" onClick={() => exportCsv("mistakes")}>Mistake notebook CSV</button>
          <button className="iconTextButton" onClick={() => exportCsv("daily")}>Daily progress CSV</button>
        </div>
      </article>

      <article className="widePanel">
        <div className="panelTitle"><h2>Backup And Restore</h2><Upload size={18} /></div>
        <div className="buttonGrid">
          <button className="iconTextButton" onClick={downloadBackup}><Download size={16} /> Download JSON backup</button>
          <button className="iconTextButton dangerAction" onClick={clearLocal}><Trash2 size={16} /> Clear local data</button>
        </div>
        <label className="fieldLine formWide">
          Restore backup JSON
          <textarea value={backupText} onChange={(event) => setBackupText(event.target.value)} placeholder="Paste backup JSON here" />
        </label>
        <button className="iconTextButton" onClick={importBackup}><RotateCcw size={16} /> Validate and restore</button>
        {message && <p className="emptyState">{message}</p>}
      </article>

      <article className="widePanel">
        <div className="panelTitle"><h2>Data Lock Validation</h2><ShieldCheck size={18} /></div>
        {validation.ok ? <p className="emptyState">Planner data is locked and valid for production.</p> : <ul className="compactList">{validation.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
        {!!validation.warnings.length && <ul className="compactList">{validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      </article>

      <article className="widePanel">
        <div className="panelTitle"><h2>QA Checklist</h2></div>
        <div className="checkGrid">
          {qaItems.map((item) => <label key={item}><input type="checkbox" readOnly /> {item}</label>)}
        </div>
      </article>
    </section>
  );
}

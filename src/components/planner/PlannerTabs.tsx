"use client";

import { Activity, AlertTriangle, BarChart3, Bell, BookOpen, Brain, CalendarDays, ClipboardList, Dumbbell, LayoutDashboard, NotebookPen, RotateCcw, Settings, Target, Timer, Table2 } from "lucide-react";

export type PlannerTab =
  | "dashboard"
  | "daily"
  | "syllabus"
  | "revision"
  | "backlog"
  | "pyq"
  | "question-bank"
  | "mocks"
  | "mistakes"
  | "weakness"
  | "analytics"
  | "timer"
  | "discipline"
  | "weekly-review"
  | "monthly-review"
  | "recall"
  | "energy"
  | "gym"
  | "reminders"
  | "settings"
  | "calendar"
  | "plan"
  | "weeks"
  | "syllabus-map";

export function PlannerTabs({
  activeTab,
  onTabChange
}: {
  activeTab: PlannerTab;
  onTabChange: (tab: PlannerTab) => void;
}) {
  return (
    <nav className="tabs" aria-label="Planner views">
      <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => onTabChange("dashboard")}>
        <LayoutDashboard size={17} /> Dashboard
      </button>
      <button className={activeTab === "daily" ? "active" : ""} onClick={() => onTabChange("daily")}>
        <ClipboardList size={17} /> Daily Plan
      </button>
      <button className={activeTab === "syllabus" ? "active" : ""} onClick={() => onTabChange("syllabus")}>
        <BookOpen size={17} /> Syllabus Tracker
      </button>
      <button className={activeTab === "revision" ? "active" : ""} onClick={() => onTabChange("revision")}>
        <RotateCcw size={17} /> Revision System
      </button>
      <button className={activeTab === "backlog" ? "active" : ""} onClick={() => onTabChange("backlog")}>
        <AlertTriangle size={17} /> Backlog Recovery
      </button>
      <button className={activeTab === "pyq" ? "active" : ""} onClick={() => onTabChange("pyq")}>
        <ClipboardList size={17} /> PYQ Tracker
      </button>
      <button className={activeTab === "question-bank" ? "active" : ""} onClick={() => onTabChange("question-bank")}>
        <BookOpen size={17} /> Question Bank
      </button>
      <button className={activeTab === "mocks" ? "active" : ""} onClick={() => onTabChange("mocks")}>
        <Target size={17} /> Mock Analysis
      </button>
      <button className={activeTab === "mistakes" ? "active" : ""} onClick={() => onTabChange("mistakes")}>
        <NotebookPen size={17} /> Mistake Notebook
      </button>
      <button className={activeTab === "weakness" ? "active" : ""} onClick={() => onTabChange("weakness")}>
        <Brain size={17} /> Weakness Engine
      </button>
      <button className={activeTab === "analytics" ? "active" : ""} onClick={() => onTabChange("analytics")}>
        <BarChart3 size={17} /> Analytics
      </button>
      <button className={activeTab === "timer" ? "active" : ""} onClick={() => onTabChange("timer")}>
        <Timer size={17} /> Deep Work
      </button>
      <button className={activeTab === "discipline" ? "active" : ""} onClick={() => onTabChange("discipline")}>
        <AlertTriangle size={17} /> Discipline
      </button>
      <button className={activeTab === "weekly-review" ? "active" : ""} onClick={() => onTabChange("weekly-review")}>
        <CalendarDays size={17} /> Weekly Review
      </button>
      <button className={activeTab === "monthly-review" ? "active" : ""} onClick={() => onTabChange("monthly-review")}>
        <BarChart3 size={17} /> Monthly Review
      </button>
      <button className={activeTab === "recall" ? "active" : ""} onClick={() => onTabChange("recall")}>
        <Brain size={17} /> Active Recall
      </button>
      <button className={activeTab === "energy" ? "active" : ""} onClick={() => onTabChange("energy")}>
        <Activity size={17} /> Energy
      </button>
      <button className={activeTab === "gym" ? "active" : ""} onClick={() => onTabChange("gym")}>
        <Dumbbell size={17} /> Gym
      </button>
      <button className={activeTab === "reminders" ? "active" : ""} onClick={() => onTabChange("reminders")}>
        <Bell size={17} /> Reminders
      </button>
      <button className={activeTab === "settings" ? "active" : ""} onClick={() => onTabChange("settings")}>
        <Settings size={17} /> Settings
      </button>
      <button className={activeTab === "calendar" ? "active" : ""} onClick={() => onTabChange("calendar")}>
        <CalendarDays size={17} /> Phase Calendar
      </button>
      <button className={activeTab === "plan" ? "active" : ""} onClick={() => onTabChange("plan")}>
        <Table2 size={17} /> Daywise Marking
      </button>
      <button className={activeTab === "weeks" ? "active" : ""} onClick={() => onTabChange("weeks")}>
        <BarChart3 size={17} /> Weekly Tracker
      </button>
      <button className={activeTab === "syllabus-map" ? "active" : ""} onClick={() => onTabChange("syllabus-map")}>
        <BookOpen size={17} /> Syllabus Map
      </button>
    </nav>
  );
}

"use client";

import { AlertTriangle, BarChart3, BookOpen, CalendarDays, ClipboardList, LayoutDashboard, RotateCcw, Table2 } from "lucide-react";

export type PlannerTab = "dashboard" | "daily" | "syllabus" | "revision" | "backlog" | "calendar" | "plan" | "weeks" | "syllabus-map";

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

"use client";

import { BarChart3, BookOpen, CalendarDays, Table2 } from "lucide-react";

export type PlannerTab = "calendar" | "plan" | "weeks" | "syllabus";

export function PlannerTabs({
  activeTab,
  onTabChange
}: {
  activeTab: PlannerTab;
  onTabChange: (tab: PlannerTab) => void;
}) {
  return (
    <nav className="tabs" aria-label="Planner views">
      <button className={activeTab === "calendar" ? "active" : ""} onClick={() => onTabChange("calendar")}>
        <CalendarDays size={17} /> Phase Calendar
      </button>
      <button className={activeTab === "plan" ? "active" : ""} onClick={() => onTabChange("plan")}>
        <Table2 size={17} /> Daywise Marking
      </button>
      <button className={activeTab === "weeks" ? "active" : ""} onClick={() => onTabChange("weeks")}>
        <BarChart3 size={17} /> Weekly Tracker
      </button>
      <button className={activeTab === "syllabus" ? "active" : ""} onClick={() => onTabChange("syllabus")}>
        <BookOpen size={17} /> Syllabus Map
      </button>
    </nav>
  );
}

import { useCallback, useEffect, useState } from "react";
import { daysBetween, todayKey } from "./dates";

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface DayLog {
  mood?: Mood;
  water?: number; // glasses
  meditation?: number; // minutes
  workout?: boolean;
  workoutNote?: string;
  checks?: Record<string, boolean>; // custom goal id -> done
}

export type GoalSource = "meditation" | "workout" | "water" | "mood" | "custom";

export interface Goal {
  id: string;
  name: string;
  target: number; // number of days
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  source: GoalSource;
}

export interface Settings {
  waterGoal: number;
}

export interface Data {
  version: 1;
  days: Record<string, DayLog>;
  goals: Goal[];
  settings: Settings;
}

const STORAGE_KEY = "quiet-tracker-v1";

function emptyData(): Data {
  return { version: 1, days: {}, goals: [], settings: { waterGoal: 8 } };
}

export function parseData(raw: unknown): Data {
  const base = emptyData();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Data>;
  return {
    version: 1,
    days: r.days && typeof r.days === "object" ? r.days : {},
    goals: Array.isArray(r.goals) ? r.goals : [],
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
}

function load(): Data {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseData(JSON.parse(raw)) : emptyData();
  } catch {
    return emptyData();
  }
}

export function useData() {
  const [data, setData] = useState<Data>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable — nothing sensible to do */
    }
  }, [data]);

  const updateDay = useCallback((key: string, patch: Partial<DayLog>) => {
    setData((d) => ({
      ...d,
      days: { ...d.days, [key]: { ...d.days[key], ...patch } },
    }));
  }, []);

  const toggleCheck = useCallback((key: string, goalId: string) => {
    setData((d) => {
      const day = d.days[key] ?? {};
      const checks = { ...(day.checks ?? {}) };
      if (checks[goalId]) delete checks[goalId];
      else checks[goalId] = true;
      return { ...d, days: { ...d.days, [key]: { ...day, checks } } };
    });
  }, []);

  const saveGoal = useCallback((goal: Goal) => {
    setData((d) => {
      const exists = d.goals.some((g) => g.id === goal.id);
      return {
        ...d,
        goals: exists ? d.goals.map((g) => (g.id === goal.id ? goal : g)) : [...d.goals, goal],
      };
    });
  }, []);

  const removeGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  return { data, setData, updateDay, toggleCheck, saveGoal, removeGoal, updateSettings };
}

/** Did this day count towards the goal? */
export function dayCounts(goal: Goal, day: DayLog | undefined, settings: Settings): boolean {
  if (!day) return false;
  switch (goal.source) {
    case "meditation":
      return (day.meditation ?? 0) > 0;
    case "workout":
      return !!day.workout;
    case "water":
      return (day.water ?? 0) >= settings.waterGoal;
    case "mood":
      return day.mood !== undefined;
    case "custom":
      return !!day.checks?.[goal.id];
  }
}

export interface GoalProgress {
  done: number;
  totalDays: number;
  elapsedDays: number;
  daysLeft: number;
  expected: number; // where an even pace would be by today
  needed: number; // still to go
  finished: boolean;
  ended: boolean;
}

export function goalProgress(goal: Goal, data: Data): GoalProgress {
  let done = 0;
  for (const [key, day] of Object.entries(data.days)) {
    if (key >= goal.start && key <= goal.end && dayCounts(goal, day, data.settings)) done++;
  }
  const today = todayKey();
  const totalDays = Math.max(1, daysBetween(goal.start, goal.end));
  let elapsedDays: number;
  if (today < goal.start) elapsedDays = 0;
  else if (today > goal.end) elapsedDays = totalDays;
  else elapsedDays = daysBetween(goal.start, today);
  const daysLeft = totalDays - elapsedDays;
  const expected = Math.round((goal.target * elapsedDays) / totalDays);
  const needed = Math.max(0, goal.target - done);
  return {
    done,
    totalDays,
    elapsedDays,
    daysLeft,
    expected,
    needed,
    finished: done >= goal.target,
    ended: today > goal.end,
  };
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const MOODS: { value: Mood; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Meh" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

export const SOURCE_LABELS: Record<GoalSource, string> = {
  custom: "Check it off each day",
  meditation: "Days I meditate",
  workout: "Days I work out",
  water: "Days I reach my water goal",
  mood: "Days I log my mood",
};

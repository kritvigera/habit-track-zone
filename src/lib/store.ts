import { useCallback, useEffect, useRef, useState } from "react";
import { daysBetween, todayKey } from "./dates";

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface DayLog {
  mood?: Mood;
  water?: number; // glasses
  meditation?: number; // minutes
  workout?: boolean;
  workoutNote?: string;
  checks?: Record<string, boolean>; // habit or custom goal id -> marked
  _t?: number; // when this day was last changed, for merging copies
}

export type GoalSource = "meditation" | "workout" | "water" | "mood" | "custom" | "habit";

export interface Goal {
  id: string;
  name: string;
  target: number; // number of days
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  source: GoalSource;
  habitId?: string; // when source is "habit"
}

/** A simple daily mark. "avoid" habits are things you'd rather not do (e.g. ate unhealthy). */
export interface Habit {
  id: string;
  name: string;
  kind: "do" | "avoid";
}

export interface Settings {
  waterGoal: number;
}

export interface Data {
  version: 1;
  days: Record<string, DayLog>;
  goals: Goal[];
  habits: Habit[];
  settings: Settings;
  updatedAt?: number; // last change of any kind
  metaAt?: number; // last change to goals, habits or settings
  resetAt?: number; // last erase or restore: older days are dropped when merging
}

const STORAGE_KEY = "quiet-tracker-v1";

function emptyData(): Data {
  return { version: 1, days: {}, goals: [], habits: [], settings: { waterGoal: 8 } };
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

export function parseData(raw: unknown): Data {
  const base = emptyData();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Data>;
  return {
    version: 1,
    days: r.days && typeof r.days === "object" ? r.days : {},
    goals: Array.isArray(r.goals) ? r.goals : [],
    habits: Array.isArray(r.habits) ? r.habits : [],
    settings: { ...base.settings, ...(r.settings ?? {}) },
    updatedAt: num(r.updatedAt),
    metaAt: num(r.metaAt),
    resetAt: num(r.resetAt),
  };
}

/** Combine two copies: each day keeps its newest version; goals/habits/settings come from the newer copy. */
export function mergeData(a: Data, b: Data): Data {
  const resetAt = Math.max(num(a.resetAt), num(b.resetAt));
  const meta = num(a.metaAt) >= num(b.metaAt) ? a : b;
  const days: Record<string, DayLog> = {};
  for (const k of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) {
    const da = a.days[k];
    const db = b.days[k];
    const pick = !db ? da : !da ? db : num(da._t) >= num(db._t) ? da : db;
    if (pick && num(pick._t) >= resetAt) days[k] = pick;
  }
  return {
    version: 1,
    days,
    goals: meta.goals,
    habits: meta.habits,
    settings: meta.settings,
    updatedAt: Math.max(num(a.updatedAt), num(b.updatedAt)),
    metaAt: Math.max(num(a.metaAt), num(b.metaAt)),
    resetAt,
  };
}

/** Key-order independent JSON, so two equal copies always compare equal. */
function canon(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  if (v && typeof v === "object")
    return (
      "{" +
      Object.keys(v)
        .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + canon((v as Record<string, unknown>)[k]))
        .join(",") +
      "}"
    );
  return JSON.stringify(v ?? null);
}

function load(): Data {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseData(JSON.parse(raw)) : emptyData();
  } catch {
    return emptyData();
  }
}

export type SyncState = "local" | "connecting" | "synced" | "offline";

// Minimal shape of the claude.ai page runtime, present only when the app runs as a Claude artifact.
type DocSnap = { exists: boolean; data(): Record<string, unknown> | undefined; metadata: { fromCache: boolean } };
type DocRef = {
  set(d: Record<string, unknown>): Promise<void>;
  onSnapshot(next: (s: DocSnap) => void, err?: (e: { code: string }) => void): () => void;
};
type ClaudeRuntime = { use(name: string): Promise<unknown> };

export function claudeRuntime(): ClaudeRuntime | undefined {
  return (window as unknown as { claude?: ClaudeRuntime }).claude;
}

export function useData() {
  const [data, setRaw] = useState<Data>(load);
  const [sync, setSync] = useState<SyncState>(() => (claudeRuntime()?.use ? "connecting" : "local"));
  const remote = useRef<DocRef | null>(null);
  const dirty = useRef(false); // a local change is waiting to be saved remotely
  const latest = useRef(data);
  latest.current = data;

  const change = useCallback((fn: (d: Data) => Data) => {
    dirty.current = true;
    setRaw((d) => ({ ...fn(d), updatedAt: Date.now() }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable */
    }
  }, [data]);

  // Sync with the Claude account when running as a claude.ai artifact.
  useEffect(() => {
    const claude = claudeRuntime();
    if (!claude?.use) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const [db, user] = (await Promise.all([claude.use("db"), claude.use("user")])) as [
        { doc(p: string): DocRef } | null,
        { id(): Promise<string | null> } | null,
      ];
      const id = user ? await user.id() : null;
      if (cancelled) return;
      if (!db || !id) {
        setSync("local");
        return;
      }
      const ref = db.doc(`data/users/${id}/tracker`);
      const timer = window.setTimeout(() => setSync((s) => (s === "connecting" ? "offline" : s)), 10_000);
      unsub = ref.onSnapshot(
        (snap) => {
          if (snap.metadata.fromCache) return;
          window.clearTimeout(timer);
          remote.current = ref;
          const local = latest.current;
          const r = snap.exists ? parseData(snap.data()) : null;
          const merged = r ? mergeData(local, r) : local;
          if (canon(merged) !== canon(local)) setRaw(merged);
          const hasContent = Object.keys(merged.days).length > 0 || merged.goals.length > 0 || merged.habits.length > 0;
          if (r ? canon(merged) !== canon(r) : hasContent) {
            dirty.current = true;
            if (canon(merged) === canon(local)) setRaw((d) => ({ ...d })); // nudge the save effect
          }
          setSync("synced");
        },
        () => {
          window.clearTimeout(timer);
          setSync("offline");
        },
      );
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  // Save to the account a moment after changes settle, one write at a time.
  const saving = useRef(false);
  useEffect(() => {
    if (!dirty.current || !remote.current || sync !== "synced") return;
    const t = window.setTimeout(async function save() {
      if (saving.current) {
        window.setTimeout(save, 500);
        return;
      }
      if (!dirty.current || !remote.current) return;
      saving.current = true;
      dirty.current = false;
      try {
        await remote.current.set(JSON.parse(JSON.stringify(latest.current)));
      } catch {
        dirty.current = true;
      } finally {
        saving.current = false;
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [data, sync]);

  const updateDay = useCallback(
    (key: string, patch: Partial<DayLog> | ((day: DayLog) => Partial<DayLog>)) => {
      change((d) => {
        const day = d.days[key] ?? {};
        const p = typeof patch === "function" ? patch(day) : patch;
        return { ...d, days: { ...d.days, [key]: { ...day, ...p, _t: Date.now() } } };
      });
    },
    [change],
  );

  const setCheck = useCallback(
    (key: string, id: string, on?: boolean) => {
      updateDay(key, (day) => {
        const checks = { ...(day.checks ?? {}) };
        const next = on ?? !checks[id];
        if (next) checks[id] = true;
        else delete checks[id];
        return { checks };
      });
    },
    [updateDay],
  );
  const toggleCheck = useCallback((key: string, id: string) => setCheck(key, id), [setCheck]);

  const changeMeta = useCallback(
    (fn: (d: Data) => Partial<Data>) => change((d) => ({ ...d, ...fn(d), metaAt: Date.now() })),
    [change],
  );

  const saveGoal = useCallback(
    (goal: Goal) =>
      changeMeta((d) => ({
        goals: d.goals.some((g) => g.id === goal.id) ? d.goals.map((g) => (g.id === goal.id ? goal : g)) : [...d.goals, goal],
      })),
    [changeMeta],
  );
  const removeGoal = useCallback((id: string) => changeMeta((d) => ({ goals: d.goals.filter((g) => g.id !== id) })), [changeMeta]);

  const saveHabit = useCallback(
    (h: Habit) =>
      changeMeta((d) => ({
        habits: d.habits.some((x) => x.id === h.id) ? d.habits.map((x) => (x.id === h.id ? h : x)) : [...d.habits, h],
      })),
    [changeMeta],
  );
  const removeHabit = useCallback(
    (id: string) =>
      changeMeta((d) => ({
        habits: d.habits.filter((h) => h.id !== id),
        goals: d.goals.filter((g) => !(g.source === "habit" && g.habitId === id)),
      })),
    [changeMeta],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => changeMeta((d) => ({ settings: { ...d.settings, ...patch } })),
    [changeMeta],
  );

  /** Replace everything (restore a backup, or erase). Wins over older copies on other devices. */
  const replaceAll = useCallback(
    (next: Data) => {
      const now = Date.now();
      const days: Record<string, DayLog> = {};
      for (const [k, v] of Object.entries(next.days)) days[k] = { ...v, _t: now };
      change(() => ({ ...next, days, metaAt: now, resetAt: now }));
    },
    [change],
  );

  const ready = sync !== "connecting";

  return {
    data,
    sync,
    ready,
    replaceAll,
    updateDay,
    setCheck,
    toggleCheck,
    saveGoal,
    removeGoal,
    saveHabit,
    removeHabit,
    updateSettings,
  };
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
    case "habit":
      return !!goal.habitId && !!day.checks?.[goal.habitId];
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
  habit: "Days I mark one of my habits",
};

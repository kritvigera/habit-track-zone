import { useCallback, useEffect, useRef, useState } from "react";
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
  updatedAt?: number; // ms timestamp of the last change, used to pick the newest copy when syncing
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
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
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

export type SyncState = "local" | "connecting" | "synced" | "offline";

// Minimal shape of the claude.ai page runtime, present only when the app runs as a Claude artifact.
type DocSnap = { exists: boolean; data(): Record<string, unknown> | undefined; metadata: { fromCache: boolean } };
type DocRef = {
  set(d: Record<string, unknown>): Promise<void>;
  onSnapshot(next: (s: DocSnap) => void, err?: (e: { code: string }) => void): () => void;
};
type ClaudeRuntime = { use(name: string): Promise<unknown> };

function hasContent(d: Data) {
  return Object.keys(d.days).length > 0 || d.goals.length > 0;
}

export function useData() {
  const [data, setRaw] = useState<Data>(load);
  const [sync, setSync] = useState<SyncState>("local");
  const remote = useRef<DocRef | null>(null);
  const dirty = useRef(false); // a local change is waiting to be saved remotely
  const latest = useRef(data);
  latest.current = data;

  // Every change made in the app goes through here, stamped with the time.
  const setData = useCallback((fn: Data | ((d: Data) => Data)) => {
    dirty.current = true;
    setRaw((d) => ({ ...(typeof fn === "function" ? fn(d) : fn), updatedAt: Date.now() }));
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
    const claude = (window as unknown as { claude?: ClaudeRuntime }).claude;
    if (!claude?.use) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;
    setSync("connecting");
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
      const timer = window.setTimeout(() => setSync("offline"), 10_000);
      unsub = ref.onSnapshot(
        (snap) => {
          if (snap.metadata.fromCache) return;
          window.clearTimeout(timer);
          remote.current = ref;
          setSync("synced");
          const local = latest.current;
          if (snap.exists) {
            const r = parseData(snap.data());
            if ((r.updatedAt ?? 0) > (local.updatedAt ?? 0)) {
              setRaw(r); // newer copy from another device: take it, don't write it back
              return;
            }
            if ((r.updatedAt ?? 0) < (local.updatedAt ?? 0)) dirty.current = true;
          } else if (hasContent(local)) {
            dirty.current = true; // first time: upload what's on this phone
          }
          if (dirty.current) setRaw((d) => ({ ...d })); // nudge the save effect
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

  const updateDay = useCallback((key: string, patch: Partial<DayLog>) => {
    setData((d) => ({
      ...d,
      days: { ...d.days, [key]: { ...d.days[key], ...patch } },
    }));
  }, [setData]);

  const toggleCheck = useCallback((key: string, goalId: string) => {
    setData((d) => {
      const day = d.days[key] ?? {};
      const checks = { ...(day.checks ?? {}) };
      if (checks[goalId]) delete checks[goalId];
      else checks[goalId] = true;
      return { ...d, days: { ...d.days, [key]: { ...day, checks } } };
    });
  }, [setData]);

  const saveGoal = useCallback((goal: Goal) => {
    setData((d) => {
      const exists = d.goals.some((g) => g.id === goal.id);
      return {
        ...d,
        goals: exists ? d.goals.map((g) => (g.id === goal.id ? goal : g)) : [...d.goals, goal],
      };
    });
  }, [setData]);

  const removeGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }, [setData]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, [setData]);

  return { data, sync, setData, updateDay, toggleCheck, saveGoal, removeGoal, updateSettings };
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

import { MOODS, claudeRuntime, useData } from "./store";
import { todayKey } from "./dates";

/** The published page's address on claude.ai; used for widget links when running there. */
export const ARTIFACT_URL = "https://claude.ai/artifact/MVBhFQrfnWeA3Tsmou6YYK";

export function appUrl(): string {
  return claudeRuntime()?.use ? ARTIFACT_URL : location.origin + location.pathname;
}

export interface QuickAction {
  hash: string;
  label: string;
}

/** Every one-tap action a widget button can trigger, as a link name. */
export function quickActions(data: ReturnType<typeof useData>["data"]): QuickAction[] {
  return [
    { hash: "quick", label: "Open quick log" },
    { hash: "add-water", label: "+1 glass of water" },
    { hash: "meditated", label: "Meditated" },
    { hash: "worked-out", label: "Worked out" },
    ...MOODS.map((m) => ({ hash: `mood-${m.label.toLowerCase()}`, label: `Mood: ${m.label}` })),
    ...data.habits.map((h) => ({ hash: `h-${h.id}`, label: h.name })),
  ];
}

/** Apply a link action to today. Returns a short note to show, or null if the name isn't an action. */
export function applyAction(name: string, store: ReturnType<typeof useData>): string | null {
  const { data, updateDay, setCheck } = store;
  const today = todayKey();
  const day = data.days[today] ?? {};
  if (name === "add-water") {
    const w = (day.water ?? 0) + 1;
    updateDay(today, (d) => ({ water: (d.water ?? 0) + 1 }));
    return `Added a glass of water. ${w} of ${data.settings.waterGoal} today.`;
  }
  if (name === "meditated") {
    updateDay(today, (d) => ({ meditation: d.meditation && d.meditation > 0 ? d.meditation : 10 }));
    return day.meditation ? "Meditation was already marked for today." : "Marked meditation (10 min). Change the minutes below if you like.";
  }
  if (name === "worked-out") {
    updateDay(today, { workout: true });
    return "Marked today’s workout.";
  }
  const mood = MOODS.find((m) => name === `mood-${m.label.toLowerCase()}`);
  if (mood) {
    updateDay(today, { mood: mood.value });
    return `Mood set to ${mood.label.toLowerCase()}.`;
  }
  if (name.startsWith("h-")) {
    const h = data.habits.find((x) => x.id === name.slice(2));
    if (!h) return "That habit no longer exists.";
    setCheck(today, h.id, true);
    return `Marked “${h.name}” for today.`;
  }
  return null;
}

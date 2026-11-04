import { useState } from "react";
import {
  Goal,
  Habit,
  GoalSource,
  SOURCE_LABELS,
  dayCounts,
  goalProgress,
  newId,
  useData,
} from "../lib/store";
import ConfirmButton from "../lib/ConfirmButton";
import { daysBetween, shortDate, toKey, todayKey } from "../lib/dates";

interface Props {
  store: ReturnType<typeof useData>;
  openDay: (key: string) => void;
  openMonth: (y: number, m: number) => void;
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function Year({ store, openDay, openMonth }: Props) {
  const { data, saveGoal, removeGoal } = store;
  const [editing, setEditing] = useState<Goal | null>(null);

  return (
    <>
      <header className="pagehead">
        <h1>Year</h1>
      </header>

      <section className="card">
        <div className="row">
          <h2>Goals</h2>
          {!editing && (
            <button className="link" onClick={() => setEditing(blankGoal())}>
              + add goal
            </button>
          )}
        </div>

        {editing && (
          <GoalForm
            initial={editing}
            habits={data.habits.filter((h) => h.kind === "do")}
            onCancel={() => setEditing(null)}
            onSave={(g) => {
              saveGoal(g);
              setEditing(null);
            }}
            onDelete={
              data.goals.some((g) => g.id === editing.id)
                ? () => {
                    removeGoal(editing.id);
                    setEditing(null);
                  }
                : undefined
            }
          />
        )}

        {!editing && data.goals.length === 0 && (
          <p className="quiet empty">
            Nothing here yet. Try something like “Meditate 180 days” or “Write 180 days”.
          </p>
        )}

        {!editing && (
          <ul className="goals">
            {data.goals.map((g) => (
              <GoalRow key={g.id} goal={g} store={store} onEdit={() => setEditing(g)} />
            ))}
          </ul>
        )}
      </section>

      <YearGrid store={store} openDay={openDay} openMonth={openMonth} />
    </>
  );
}

function blankGoal(): Goal {
  const y = new Date().getFullYear();
  return {
    id: newId(),
    name: "",
    target: 180,
    start: todayKey(),
    end: `${y}-12-31`,
    source: "custom",
  };
}

function GoalRow({ goal, store, onEdit }: { goal: Goal; store: Props["store"]; onEdit: () => void }) {
  const p = goalProgress(goal, store.data);
  const pct = Math.min(100, Math.round((p.done / Math.max(1, goal.target)) * 100));
  const notStarted = todayKey() < goal.start;

  let note: string;
  if (p.finished) note = "Done. Nicely kept.";
  else if (p.ended) note = `Ended at ${p.done} of ${goal.target}.`;
  else if (notStarted) note = `Starts ${shortDate(goal.start)}.`;
  else if (p.needed > p.daysLeft + 1) note = `${p.needed} to go, ${p.daysLeft + 1} days left. Maybe adjust the goal.`;
  else {
    const diff = p.done - p.expected;
    const pace = diff >= 0 ? "on pace" : `${-diff} behind an even pace`;
    note = `${p.needed} to go · ${p.daysLeft} days left · ${pace}`;
  }

  return (
    <li>
      <button className="goal" onClick={onEdit}>
        <div className="row">
          <span className="goal__name">{goal.name}</span>
          <span className="quiet">
            {p.done} / {goal.target}
          </span>
        </div>
        <div className="bar">
          <span style={{ width: `${pct}%` }} />
          {!p.ended && !notStarted && (
            <i
              className="bar__pace"
              style={{ left: `${Math.min(100, (p.expected / Math.max(1, goal.target)) * 100)}%` }}
            />
          )}
        </div>
        <div className="goal__note quiet">
          {note}
          <br />
          until {shortDate(goal.end)}
        </div>
      </button>
    </li>
  );
}

function GoalForm({
  initial,
  habits,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Goal;
  habits: Habit[];
  onSave: (g: Goal) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [g, setG] = useState<Goal>(initial);
  const span = g.start && g.end && g.end >= g.start ? daysBetween(g.start, g.end) : 0;
  const valid = g.name.trim() !== "" && g.target > 0 && span > 0 && (g.source !== "habit" || !!g.habitId);
  const year = new Date().getFullYear();

  const setSource = (source: GoalSource) => {
    const names: Partial<Record<GoalSource, string>> = {
      meditation: "Meditate",
      workout: "Work out",
      water: "Drink enough water",
      mood: "Check in with my mood",
    };
    if (source === "habit" && habits[0]) names.habit = habits[0].name;
    const auto = [...Object.values(names), ...habits.map((h) => h.name)];
    setG((cur) => ({
      ...cur,
      source,
      habitId: source === "habit" ? (cur.habitId ?? habits[0]?.id) : undefined,
      name: cur.name.trim() === "" || auto.includes(cur.name) ? names[source] ?? "" : cur.name,
    }));
  };

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave({ ...g, name: g.name.trim() });
      }}
    >
      <label>
        <span>Counts when</span>
        <select className="field" value={g.source} onChange={(e) => setSource(e.target.value as GoalSource)}>
          {(Object.keys(SOURCE_LABELS) as GoalSource[])
            .filter((s) => s !== "habit" || habits.length > 0)
            .map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
        </select>
      </label>

      {g.source === "habit" && (
        <label>
          <span>Which habit</span>
          <select
            id="goal-habit"
            className="field"
            value={g.habitId ?? ""}
            onChange={(e) => {
              const h = habits.find((x) => x.id === e.target.value);
              const prev = habits.find((x) => x.id === g.habitId);
              setG({ ...g, habitId: e.target.value, name: !g.name || g.name === prev?.name ? h?.name ?? g.name : g.name });
            }}
          >
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        <span>Name</span>
        <input
          className="field"
          placeholder="e.g. Write"
          value={g.name}
          onChange={(e) => setG({ ...g, name: e.target.value })}
        />
      </label>

      <label>
        <span>How many days</span>
        <input
          className="field"
          type="number"
          inputMode="numeric"
          min={1}
          value={g.target || ""}
          onChange={(e) => setG({ ...g, target: Math.max(0, Math.round(Number(e.target.value))) })}
        />
      </label>

      <div className="form__dates">
        <label>
          <span>From</span>
          <input className="field" type="date" value={g.start} onChange={(e) => setG({ ...g, start: e.target.value })} />
        </label>
        <label>
          <span>Until</span>
          <input className="field" type="date" value={g.end} onChange={(e) => setG({ ...g, end: e.target.value })} />
        </label>
      </div>

      <div className="chips">
        <button type="button" className="chip" onClick={() => setG({ ...g, start: `${year}-01-01`, end: `${year}-12-31` })}>
          this year
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => setG({ ...g, start: `${year + 1}-01-01`, end: `${year + 1}-12-31` })}
        >
          next year
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            const end = new Date();
            end.setFullYear(end.getFullYear() + 1);
            end.setDate(end.getDate() - 1);
            setG({ ...g, start: todayKey(), end: toKey(end) });
          }}
        >
          next 12 months
        </button>
      </div>

      {span > 0 && g.target > span && (
        <p className="quiet">That window only has {span} days.</p>
      )}
      {span > 0 && g.target <= span && (
        <p className="quiet">
          {g.target} of {span} days — about {Math.round((g.target / span) * 7 * 10) / 10} days a week.
        </p>
      )}

      <div className="form__actions">
        {onDelete && (
          <ConfirmButton label="remove" confirmLabel="tap again to remove" onConfirm={onDelete} />
        )}
        <span style={{ flex: 1 }} />
        <button type="button" className="pill" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pill pill--solid" disabled={!valid}>
          Save
        </button>
      </div>
    </form>
  );
}

type Metric = { id: string; label: string; goal?: Goal; habit?: Habit };

function YearGrid({ store, openDay, openMonth }: Props) {
  const { data } = store;
  const [year, setYear] = useState(new Date().getFullYear());
  const [metricId, setMetricId] = useState("mood");

  const metrics: Metric[] = [
    { id: "mood", label: "Mood" },
    { id: "water", label: "Water" },
    { id: "meditation", label: "Meditation" },
    { id: "workout", label: "Workout" },
    ...data.habits.map((h) => ({ id: h.id, label: h.name, habit: h })),
    ...data.goals.filter((g) => g.source === "custom").map((g) => ({ id: g.id, label: g.name, goal: g })),
  ];
  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];
  const today = todayKey();

  const cellStyle = (key: string): React.CSSProperties | undefined => {
    const d = data.days[key];
    if (!d) return undefined;
    switch (metric.id) {
      case "mood":
        return d.mood ? { background: `var(--mood-${d.mood})` } : undefined;
      case "water": {
        const w = d.water ?? 0;
        if (!w) return undefined;
        const f = Math.min(1, w / data.settings.waterGoal);
        return { background: "var(--water)", opacity: 0.35 + 0.65 * f };
      }
      case "meditation":
        return (d.meditation ?? 0) > 0 ? { background: "var(--meditation)" } : undefined;
      case "workout":
        return d.workout ? { background: "var(--workout)" } : undefined;
      default:
        if (metric.habit)
          return d.checks?.[metric.habit.id]
            ? { background: metric.habit.kind === "avoid" ? "var(--avoid)" : "var(--custom)" }
            : undefined;
        return metric.goal && dayCounts(metric.goal, d, data.settings)
          ? { background: "var(--custom)" }
          : undefined;
    }
  };

  let count = 0;
  const rows = MONTHS.map((_, m) => {
    const len = new Date(year, m + 1, 0).getDate();
    return Array.from({ length: 31 }, (_, i) => {
      if (i >= len) return null;
      const key = toKey(new Date(year, m, i + 1));
      const style = cellStyle(key);
      if (style) count++;
      return { key, style };
    });
  });

  return (
    <section className="card">
      <div className="row">
        <h2>At a glance</h2>
        <div className="yearpick">
          <button className="ghost ghost--sm" aria-label="Previous year" onClick={() => setYear(year - 1)}>
            ‹
          </button>
          <span>{year}</span>
          <button className="ghost ghost--sm" aria-label="Next year" onClick={() => setYear(year + 1)}>
            ›
          </button>
        </div>
      </div>

      <div className="chips chips--scroll">
        {metrics.map((m) => (
          <button
            key={m.id}
            className={"chip" + (m.id === metric.id ? " chip--on" : "")}
            onClick={() => setMetricId(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid" role="grid" aria-label={`${metric.label} in ${year}`}>
        {rows.map((cells, m) => (
          <div className="grid__row" key={m} role="row">
            <button
              className="grid__month"
              aria-label={new Date(year, m, 1).toLocaleDateString(undefined, { month: "long" })}
              onClick={() => openMonth(year, m)}
            >
              {MONTHS[m]}
            </button>
            {cells.map((c, i) =>
              c ? (
                <button
                  key={i}
                  className={"cell" + (c.key === today ? " cell--today" : "") + (c.key > today ? " cell--future" : "")}
                  style={c.style}
                  aria-label={shortDate(c.key)}
                  disabled={c.key > today}
                  onClick={() => openDay(c.key)}
                />
              ) : (
                <span key={i} className="cell cell--none" />
              ),
            )}
          </div>
        ))}
      </div>
      <p className="quiet">
        {count} {count === 1 ? "day" : "days"} {metric.id === "mood" || metric.id === "water" ? "logged" : "marked"} in {year}. Tap a day to open it, or a letter for the month.
      </p>
    </section>
  );
}

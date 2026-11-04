import { MOODS, useData } from "../lib/store";
import { todayKey } from "../lib/dates";

interface Props {
  store: ReturnType<typeof useData>;
  note: string;
  openToday: () => void;
}

/** A compact one-screen log, opened from widget buttons. */
export default function Quick({ store, note, openToday }: Props) {
  const { data, updateDay, toggleCheck } = store;
  const today = todayKey();
  const day = data.days[today] ?? {};
  const water = day.water ?? 0;
  const med = day.meditation ?? 0;
  const items = [
    ...data.goals
      .filter((g) => g.source === "custom" && today >= g.start && today <= g.end)
      .map((g) => ({ id: g.id, name: g.name, kind: "do" as const })),
    ...data.habits,
  ];

  return (
    <>
      <header className="pagehead">
        <h1>Quick log</h1>
      </header>

      {note && (
        <p className="note" role="status">
          {note}
        </p>
      )}

      <section className="card">
        <div className="moods">
          {MOODS.map((m) => (
            <button
              key={m.value}
              className={"mood" + (day.mood === m.value ? " mood--on" : "")}
              style={{ ["--c" as string]: `var(--mood-${m.value})` }}
              aria-pressed={day.mood === m.value}
              onClick={() => updateDay(today, { mood: day.mood === m.value ? undefined : m.value })}
            >
              <span className="mood__dot" />
              <span className="mood__label">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="tiles">
        <button className="tile tile--water" onClick={() => updateDay(today, (d) => ({ water: (d.water ?? 0) + 1 }))}>
          <span className="tile__label">+1 water</span>
          <span className="tile__value">
            {water} / {data.settings.waterGoal}
          </span>
        </button>
        <button
          className={"tile tile--med" + (med > 0 ? " tile--on" : "")}
          aria-pressed={med > 0}
          onClick={() => updateDay(today, { meditation: med > 0 ? 0 : 10 })}
        >
          <span className="tile__label">Meditated</span>
          <span className="tile__value">{med > 0 ? `${med} min` : "not yet"}</span>
        </button>
        <button
          className={"tile tile--work" + (day.workout ? " tile--on" : "")}
          aria-pressed={!!day.workout}
          onClick={() => updateDay(today, { workout: !day.workout })}
        >
          <span className="tile__label">Worked out</span>
          <span className="tile__value">{day.workout ? "done" : "not yet"}</span>
        </button>
        {items.map((h) => {
          const on = !!day.checks?.[h.id];
          return (
            <button
              key={h.id}
              className={"tile " + (h.kind === "avoid" ? "tile--avoid" : "tile--habit") + (on ? " tile--on" : "")}
              aria-pressed={on}
              onClick={() => toggleCheck(today, h.id)}
            >
              <span className="tile__label">{h.name}</span>
              <span className="tile__value">{on ? "marked" : "—"}</span>
            </button>
          );
        })}
      </div>

      <button className="link" onClick={openToday}>
        Open the full day
      </button>
    </>
  );
}

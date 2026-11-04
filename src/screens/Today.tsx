import { useState } from "react";
import { Habit, MOODS, newId, useData } from "../lib/store";
import { addDays, friendlyDate, todayKey } from "../lib/dates";

interface Props {
  store: ReturnType<typeof useData>;
  date: string;
  setDate: (key: string) => void;
}

export default function Today({ store, date, setDate }: Props) {
  const { data, updateDay } = store;
  const day = data.days[date] ?? {};
  const waterGoal = data.settings.waterGoal;
  const water = day.water ?? 0;
  const meditation = day.meditation ?? 0;
  const isToday = date === todayKey();
  const [otherOpen, setOtherOpen] = useState(false);
  const PRESETS = [5, 10, 15, 20, 30];

  return (
    <>
      <header className="dayhead">
        <button className="ghost" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
          ‹
        </button>
        <div className="dayhead__title">
          <h1>{friendlyDate(date)}</h1>
          {!isToday && (
            <button className="link" onClick={() => setDate(todayKey())}>
              back to today
            </button>
          )}
        </div>
        <button
          className="ghost"
          aria-label="Next day"
          disabled={isToday}
          onClick={() => setDate(addDays(date, 1))}
        >
          ›
        </button>
      </header>

      <section className="card">
        <h2>Mood</h2>
        <div className="moods">
          {MOODS.map((m) => (
            <button
              key={m.value}
              className={"mood" + (day.mood === m.value ? " mood--on" : "")}
              style={{ ["--c" as string]: `var(--mood-${m.value})` }}
              aria-pressed={day.mood === m.value}
              onClick={() => updateDay(date, { mood: day.mood === m.value ? undefined : m.value })}
            >
              <span className="mood__dot" />
              <span className="mood__label">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="row">
          <h2>Water</h2>
          <span className="quiet">
            {water} of {waterGoal} glasses
          </span>
        </div>
        <div className="glasses" aria-hidden>
          {Array.from({ length: Math.max(waterGoal, water) }, (_, i) => (
            <span key={i} className={"glass" + (i < water ? " glass--on" : "")} />
          ))}
        </div>
        <div className="stepper">
          <button
            className="pill"
            aria-label="One glass less"
            disabled={water === 0}
            onClick={() => updateDay(date, { water: Math.max(0, water - 1) })}
          >
            −
          </button>
          <button
            className="pill pill--wide"
            onClick={() => updateDay(date, { water: water + 1 })}
          >
            + 1 glass
          </button>
        </div>
      </section>

      <section className="card">
        <div className="row">
          <h2>Meditation</h2>
          <span className="quiet">{meditation > 0 ? `${meditation} min` : "not yet"}</span>
        </div>
        <div className="chips chips--even">
          {PRESETS.map((m) => (
            <button
              key={m}
              className={"chip" + (meditation === m ? " chip--on" : "")}
              aria-pressed={meditation === m}
              onClick={() => updateDay(date, { meditation: meditation === m ? 0 : m })}
            >
              {m}
            </button>
          ))}
          <button
            className={"chip" + (otherOpen || (meditation > 0 && !PRESETS.includes(meditation)) ? " chip--on" : "")}
            onClick={() => setOtherOpen(!otherOpen)}
          >
            other
          </button>
        </div>
        {otherOpen && (
          <label className="inline-field">
            <input
              id="meditation-minutes"
              className="field"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Minutes"
              value={meditation || ""}
              onChange={(e) => updateDay(date, { meditation: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
            />
            <span className="quiet">min</span>
          </label>
        )}
      </section>

      <section className="card">
        <div className="row">
          <h2>Workout</h2>
          <button
            className={"toggle" + (day.workout ? " toggle--on" : "")}
            role="switch"
            aria-checked={!!day.workout}
            aria-label="Worked out"
            onClick={() => updateDay(date, { workout: !day.workout })}
          >
            <span />
          </button>
        </div>
        {day.workout && (
          <input
            id="workout-note"
            className="field"
            placeholder="What did you do? (optional)"
            value={day.workoutNote ?? ""}
            onChange={(e) => updateDay(date, { workoutNote: e.target.value })}
          />
        )}
      </section>

      <HabitsCard store={store} date={date} />
    </>
  );
}

function HabitsCard({ store, date }: { store: Props["store"]; date: string }) {
  const { data, toggleCheck, saveHabit } = store;
  const day = data.days[date] ?? {};
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Habit["kind"]>("do");
  const customGoals = data.goals.filter((g) => g.source === "custom" && date >= g.start && date <= g.end);
  const items = [
    ...customGoals.map((g) => ({ id: g.id, name: g.name, kind: "do" as const })),
    ...data.habits,
  ];

  return (
    <section className="card">
      <div className="row">
        <h2>Habits</h2>
        {!adding && (
          <button className="link" onClick={() => setAdding(true)}>
            + add habit
          </button>
        )}
      </div>

      {items.length === 0 && !adding && (
        <p className="quiet">
          Mark anything else here: “Read”, “Walked outside”, or things to avoid like “Ate unhealthy”.
        </p>
      )}

      {items.length > 0 && (
        <ul className="checklist">
          {items.map((h) => {
            const on = !!day.checks?.[h.id];
            return (
              <li key={h.id}>
                <button
                  className={"check" + (h.kind === "avoid" ? " check--avoid" : "") + (on ? " check--on" : "")}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggleCheck(date, h.id)}
                >
                  <span className="check__box" />
                  {h.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {adding && (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            saveHabit({ id: newId(), name: name.trim(), kind });
            setName("");
            setKind("do");
            setAdding(false);
          }}
        >
          <input
            id="new-habit"
            className="field"
            placeholder="e.g. Read, or Ate unhealthy"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          <div className="chips">
            <button type="button" className={"chip" + (kind === "do" ? " chip--on" : "")} onClick={() => setKind("do")}>
              something to do
            </button>
            <button
              type="button"
              className={"chip" + (kind === "avoid" ? " chip--on chip--avoid" : "")}
              onClick={() => setKind("avoid")}
            >
              something to avoid
            </button>
          </div>
          <div className="form__actions">
            <span style={{ flex: 1 }} />
            <button type="button" className="pill" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="pill pill--solid" disabled={!name.trim()}>
              Add
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

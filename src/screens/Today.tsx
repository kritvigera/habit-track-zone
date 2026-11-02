import { useState } from "react";
import { MOODS, useData } from "../lib/store";
import { addDays, friendlyDate, todayKey } from "../lib/dates";

interface Props {
  store: ReturnType<typeof useData>;
  date: string;
  setDate: (key: string) => void;
}

export default function Today({ store, date, setDate }: Props) {
  const { data, updateDay, toggleCheck } = store;
  const day = data.days[date] ?? {};
  const waterGoal = data.settings.waterGoal;
  const water = day.water ?? 0;
  const meditation = day.meditation ?? 0;
  const isToday = date === todayKey();
  const [otherOpen, setOtherOpen] = useState(false);
  const PRESETS = [5, 10, 15, 20, 30];
  const customGoals = data.goals.filter(
    (g) => g.source === "custom" && date >= g.start && date <= g.end,
  );

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

      {customGoals.length > 0 && (
        <section className="card">
          <h2>Also today</h2>
          <ul className="checklist">
            {customGoals.map((g) => {
              const on = !!day.checks?.[g.id];
              return (
                <li key={g.id}>
                  <button
                    className={"check" + (on ? " check--on" : "")}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleCheck(date, g.id)}
                  >
                    <span className="check__box" />
                    {g.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

import { MOODS, dayCounts, useData } from "../lib/store";
import { toKey, todayKey } from "../lib/dates";

interface Props {
  store: ReturnType<typeof useData>;
  month: { y: number; m: number };
  setMonth: (v: { y: number; m: number }) => void;
  openDay: (key: string) => void;
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Month({ store, month, setMonth, openDay }: Props) {
  const { data } = store;
  const { y, m } = month;
  const today = todayKey();
  const len = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
  const keys = Array.from({ length: len }, (_, i) => toKey(new Date(y, m, i + 1)));
  const customGoals = data.goals.filter((g) => g.source === "custom");
  const waterGoal = data.settings.waterGoal;

  const shift = (n: number) => {
    const d = new Date(y, m + n, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const title = new Date(y, m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const isCurrent = y === new Date().getFullYear() && m === new Date().getMonth();

  // Totals for the month
  let water = 0,
    meditation = 0,
    minutes = 0,
    workout = 0,
    moodDays = 0,
    moodSum = 0;
  const goalDays: Record<string, number> = {};
  for (const k of keys) {
    const d = data.days[k];
    if (!d) continue;
    if ((d.water ?? 0) >= waterGoal) water++;
    if ((d.meditation ?? 0) > 0) {
      meditation++;
      minutes += d.meditation ?? 0;
    }
    if (d.workout) workout++;
    if (d.mood) {
      moodDays++;
      moodSum += d.mood;
    }
    for (const g of customGoals) if (dayCounts(g, d, data.settings)) goalDays[g.id] = (goalDays[g.id] ?? 0) + 1;
  }
  const avgMood = moodDays ? MOODS[Math.round(moodSum / moodDays) - 1] : undefined;

  return (
    <>
      <header className="dayhead">
        <button className="ghost" aria-label="Previous month" onClick={() => shift(-1)}>
          ‹
        </button>
        <div className="dayhead__title">
          <h1>{title}</h1>
          {!isCurrent && (
            <button className="link" onClick={() => setMonth({ y: new Date().getFullYear(), m: new Date().getMonth() })}>
              back to this month
            </button>
          )}
        </div>
        <button className="ghost" aria-label="Next month" onClick={() => shift(1)}>
          ›
        </button>
      </header>

      <section className="card card--cal">
        <div className="cal">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="cal__wd">
              {w}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={"x" + i} />
          ))}
          {keys.map((k, i) => {
            const d = data.days[k];
            const future = k > today;
            const anyGoal = !!d && customGoals.some((g) => dayCounts(g, d, data.settings));
            return (
              <button
                key={k}
                className={"day" + (k === today ? " day--today" : "") + (future ? " day--future" : "")}
                style={d?.mood ? { background: `var(--mood-${d.mood})` } : undefined}
                disabled={future}
                aria-label={k}
                onClick={() => openDay(k)}
              >
                <span className="day__n">{i + 1}</span>
                <span className="day__marks">
                  {d && (d.water ?? 0) > 0 && (
                    <i
                      className="mk mk--water"
                      style={(d.water ?? 0) < waterGoal ? { opacity: 0.45 } : undefined}
                    />
                  )}
                  {(d?.meditation ?? 0) > 0 && <i className="mk mk--med" />}
                  {d?.workout && <i className="mk mk--work" />}
                  {anyGoal && <i className="mk mk--goal" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="legend">
          <span>
            <i className="mk mk--water" /> water goal
          </span>
          <span>
            <i className="mk mk--med" /> meditation
          </span>
          <span>
            <i className="mk mk--work" /> workout
          </span>
          {customGoals.length > 0 && (
            <span>
              <i className="mk mk--goal" /> your goals
            </span>
          )}
          <span>
            <i className="mk mk--mood" /> background is mood
          </span>
        </div>
      </section>

      <section className="card">
        <h2>This month</h2>
        <ul className="totals">
          <li>
            <span>Mood</span>
            <span className="quiet">
              {avgMood ? `mostly ${avgMood.label.toLowerCase()} · ${moodDays} days logged` : "nothing logged"}
            </span>
          </li>
          <li>
            <span>Water goal reached</span>
            <span className="quiet">{water} days</span>
          </li>
          <li>
            <span>Meditated</span>
            <span className="quiet">
              {meditation} days{minutes ? ` · ${minutes} min` : ""}
            </span>
          </li>
          <li>
            <span>Worked out</span>
            <span className="quiet">{workout} days</span>
          </li>
          {customGoals.map((g) => (
            <li key={g.id}>
              <span>{g.name}</span>
              <span className="quiet">{goalDays[g.id] ?? 0} days</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

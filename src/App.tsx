import { useState } from "react";
import { useData } from "./lib/store";
import { todayKey } from "./lib/dates";
import Today from "./screens/Today";
import Year from "./screens/Year";
import SettingsScreen from "./screens/Settings";

type Tab = "today" | "year" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "year", label: "Year" },
  { id: "settings", label: "Settings" },
];

export default function App() {
  const store = useData();
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState(todayKey());

  const openDay = (key: string) => {
    setDate(key);
    setTab("today");
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <main className="screen">
        {tab === "today" && <Today store={store} date={date} setDate={setDate} />}
        {tab === "year" && <Year store={store} openDay={openDay} />}
        {tab === "settings" && <SettingsScreen store={store} />}
      </main>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={"tab" + (tab === t.id ? " tab--on" : "")}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => {
              setTab(t.id);
              if (t.id === "today") setDate(todayKey());
              window.scrollTo(0, 0);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

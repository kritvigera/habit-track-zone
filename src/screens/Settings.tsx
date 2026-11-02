import { useRef, useState } from "react";
import { parseData, useData } from "../lib/store";
import { todayKey } from "../lib/dates";

interface Props {
  store: ReturnType<typeof useData>;
}

export default function SettingsScreen({ store }: Props) {
  const { data, setData, updateSettings } = store;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const exportData = async () => {
    const json = JSON.stringify(data, null, 2);
    const name = `tracker-backup-${todayKey()}.json`;
    const file = new File([json], name, { type: "application/json" });
    // On iPhone the share sheet lets you save to Files or send it somewhere.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        return;
      } catch {
        /* cancelled — fall through to download */
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const parsed = parseData(JSON.parse(await file.text()));
      if (!window.confirm("Replace everything on this phone with the backup?")) return;
      setData(parsed);
      setMsg("Backup restored.");
    } catch {
      setMsg("That file couldn’t be read.");
    }
  };

  return (
    <>
      <header className="pagehead">
        <h1>Settings</h1>
      </header>

      <section className="card">
        <div className="row">
          <h2>Daily water goal</h2>
          <div className="stepper stepper--inline">
            <button
              className="pill"
              aria-label="Lower water goal"
              disabled={data.settings.waterGoal <= 1}
              onClick={() => updateSettings({ waterGoal: data.settings.waterGoal - 1 })}
            >
              −
            </button>
            <span className="stepper__value">{data.settings.waterGoal}</span>
            <button
              className="pill"
              aria-label="Raise water goal"
              onClick={() => updateSettings({ waterGoal: data.settings.waterGoal + 1 })}
            >
              +
            </button>
          </div>
        </div>
        <p className="quiet">glasses a day</p>
      </section>

      <section className="card">
        <h2>Your data</h2>
        <p className="quiet">
          Everything stays on this phone. Save a backup now and then, so nothing is lost if you change phones.
        </p>
        <div className="stack">
          <button className="pill pill--wide" onClick={exportData}>
            Save a backup
          </button>
          <button className="pill pill--wide" onClick={() => fileRef.current?.click()}>
            Restore from backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
        </div>
        {msg && <p className="quiet">{msg}</p>}
      </section>

      <section className="card">
        <h2>Add to Home Screen</h2>
        <p className="quiet">
          In Safari, tap the Share button, then “Add to Home Screen”. It then opens full screen like any other app and
          works offline.
        </p>
      </section>

      <section className="card">
        <button
          className="link link--soft"
          onClick={() => {
            if (window.confirm("Erase all entries and goals? This can’t be undone.")) {
              setData(parseData(null));
              setMsg("");
            }
          }}
        >
          Erase everything
        </button>
      </section>
    </>
  );
}

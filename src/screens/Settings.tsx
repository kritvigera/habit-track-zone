import { useRef, useState } from "react";
import { parseData, useData } from "../lib/store";
import { todayKey } from "../lib/dates";
import ConfirmButton from "../lib/ConfirmButton";

interface Props {
  store: ReturnType<typeof useData>;
}

export default function SettingsScreen({ store }: Props) {
  const { data, sync, setData, updateSettings } = store;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState<ReturnType<typeof parseData> | null>(null);

  const exportData = async () => {
    const json = JSON.stringify(data, null, 2);
    const name = `tracker-backup-${todayKey()}.json`;
    // Inside Claude, files go through the page's download prompt.
    const claude = (window as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
    if (claude?.use) {
      const dl = (await claude.use("downloads")) as {
        save(r: { filename: string; data: string }): Promise<unknown>;
      } | null;
      if (dl) {
        try {
          await dl.save({ filename: name, data: json });
          setMsg("Backup saved.");
        } catch (e) {
          const code = (e as { code?: string })?.code;
          setMsg(code === "declined" ? "" : "The backup couldn’t be saved here.");
        }
        return;
      }
    }
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
      setPending(parsed);
      setMsg("");
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
          {sync === "synced"
            ? "Saved privately to your Claude account and on this phone. Only you can see it."
            : sync === "connecting"
              ? "Connecting…"
              : sync === "offline"
                ? "Saved on this phone. Your account can’t be reached right now; it will catch up later."
                : "Everything stays on this phone."}{" "}
          A backup now and then doesn’t hurt.
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
        {pending && (
          <div className="notice">
            <p className="quiet">
              This backup has {Object.keys(pending.days).length} days and {pending.goals.length} goals. Replace what’s here
              with it?
            </p>
            <div className="form__actions">
              <span style={{ flex: 1 }} />
              <button className="pill" onClick={() => setPending(null)}>
                Cancel
              </button>
              <button
                className="pill pill--solid"
                onClick={() => {
                  setData(pending);
                  setPending(null);
                  setMsg("Backup restored.");
                }}
              >
                Replace
              </button>
            </div>
          </div>
        )}
        {msg && <p className="quiet">{msg}</p>}
      </section>

      <section className="card">
        <h2>Add to Home Screen</h2>
        <p className="quiet">
          In Safari, tap the Share button, then “Add to Home Screen”. It then sits on your Home Screen like any other
          app.
        </p>
      </section>

      <section className="card">
        <ConfirmButton
          label="Erase everything"
          confirmLabel="Tap again to erase all entries and goals"
          onConfirm={() => {
            setData(parseData(null));
            setMsg("");
          }}
        />
      </section>
    </>
  );
}

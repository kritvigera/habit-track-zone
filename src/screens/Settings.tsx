import { useRef, useState } from "react";
import { claudeRuntime, parseData, useData } from "../lib/store";
import { todayKey } from "../lib/dates";
import ConfirmButton from "../lib/ConfirmButton";
import { appUrl, quickActions } from "../lib/actions";

interface Props {
  store: ReturnType<typeof useData>;
}

export default function SettingsScreen({ store }: Props) {
  const { data, sync, replaceAll, updateSettings, removeHabit } = store;
  const [copied, setCopied] = useState("");
  // Widget links only reach your data on the claude.ai version, which saves to your account.
  // A Home Screen web app keeps its storage apart from Safari, where Shortcuts open links.
  const onClaude = !!claudeRuntime()?.use;
  const standalone =
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches;
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
                  replaceAll(pending);
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
        <h2>Habits</h2>
        {data.habits.length === 0 ? (
          <p className="quiet">No habits yet. Add them from the Habits card on Today.</p>
        ) : (
          <ul>
            {data.habits.map((h) => (
              <li key={h.id} className="linkrow">
                <span className="linkrow__text">
                  <span>{h.name}</span>
                  <span className="quiet">{h.kind === "avoid" ? "something to avoid" : "something to do"}</span>
                </span>
                <ConfirmButton label="remove" confirmLabel="tap again" onConfirm={() => removeHabit(h.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Home Screen widget</h2>
        {!onClaude ? (
          <p className="quiet">
            iPhone keeps a Home Screen app’s data separate from Safari, and widget buttons open Safari, so they can’t log
            into this app. Keep the app icon near your thumb instead: it opens straight to Today.
          </p>
        ) : (
          <>
        <p className="quiet">
          Use the Shortcuts app to put one-tap buttons on your Home Screen. Each button logs something for today and
          opens this tracker for a moment, so you can see it worked.
        </p>
        <ol className="steps">
          <li>Copy a link below.</li>
          <li>
            Open Shortcuts, tap <b>+</b>, add the action <b>Open URLs</b> and paste the link. Name the shortcut, e.g.
            “Water”.
          </li>
          <li>Do the same for the other buttons you want.</li>
          <li>
            Touch and hold the Home Screen, tap <b>Edit → Add Widget</b>, choose <b>Shortcuts</b> and pick the size that
            shows four buttons. Tap the widget while editing to choose which shortcuts it shows.
          </li>
        </ol>
        <ul>
          {quickActions(data).map((a) => {
            const url = `${appUrl()}#${a.hash}`;
            return (
              <li key={a.hash} className="linkrow">
                <span className="linkrow__text">
                  <span>{a.label}</span>
                  <span className="linkrow__url">{url}</span>
                </span>
                <button
                  className="pill pill--sm"
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(url)
                      .then(() => setCopied(a.hash))
                      .catch(() => setCopied("fail:" + a.hash));
                  }}
                >
                  {copied === a.hash ? "Copied" : "Copy"}
                </button>
              </li>
            );
          })}
        </ul>
        {copied.startsWith("fail:") && (
          <p className="quiet">Copying isn’t allowed here. Press and hold the link text to select and copy it.</p>
        )}
          </>
        )}
      </section>

      {!standalone && (
      <section className="card">
        <h2>Add to Home Screen</h2>
        <p className="quiet">
          In Safari, tap the Share button, then “Add to Home Screen”. It then sits on your Home Screen like any other
          app.
        </p>
      </section>
      )}

      <section className="card">
        <ConfirmButton
          label="Erase everything"
          confirmLabel="Tap again to erase all entries and goals"
          onConfirm={() => {
            replaceAll(parseData(null));
            setMsg("");
          }}
        />
      </section>
    </>
  );
}

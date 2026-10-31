import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Flag,
  Flame,
  Home,
  LayoutGrid,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  LogIn,
  Palette,
  Compass,
  Download,
  Link,
  Menu,
} from "lucide-react";
import { Brand, Astronaut, Modal, cn } from "./components/Primitives";
import Checkin from "./components/Checkin";
import { readState, themes, type State, type Theme, dayKey } from "./data";
import { recordCheckin, currentStreak } from "./streak.mjs";
import {
  Today,
  Crews,
  CrewDetail,
  Challenges,
  ChallengeDetail,
  Rankings,
  Profile,
  NotFound,
  type PageProps,
} from "./pages";
import DesignLab, { Welcome } from "./DesignLab";
const nav = [
  { id: "today", label: "Today", icon: Home },
  { id: "crews", label: "The crew", icon: Users },
  { id: "challenges", label: "Missions", icon: Flag },
  { id: "rankings", label: "Leaderboard", icon: Trophy },
];
export default function App() {
  const [state, setState] = useState<State>(readState);
  const [route, setRoute] = useState(location.hash.slice(1) || "today");
  const [modal, setModal] = useState("");
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [menu, setMenu] = useState(false);
  const update = (s: Partial<State>) => setState((old) => ({ ...old, ...s }));
  const go = (r: string) => {
    location.hash = r;
    setMenu(false);
  };
  const notify = (s: string) => setToast(s);
  useEffect(() => {
    const fn = () => {
      setRoute(location.hash.slice(1) || "today");
      setModal("");
      setMenu(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("locked-in-v1", JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    document.documentElement.dataset.theme = state.theme;
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(id);
  }, [toast]);
  const p: PageProps = { state, update, open: setModal, notify, go };
  let page;
  const [section, id] = route.split("/");
  switch (section) {
    case "today":
      page = <Today {...p} />;
      break;
    case "crews":
      page = <Crews {...p} />;
      break;
    case "crew":
      page = <CrewDetail {...p} id={id} />;
      break;
    case "challenges":
      page = <Challenges {...p} />;
      break;
    case "challenge":
      page = <ChallengeDetail {...p} id={id} />;
      break;
    case "rankings":
      page = <Rankings {...p} />;
      break;
    case "profile":
      page = <Profile {...p} />;
      break;
    case "lab":
      page = <DesignLab {...p} />;
      break;
    case "welcome":
      page = <Welcome {...p} />;
      break;
    case "invite":
      page = <JoinLanding {...p} code={id} />;
      break;
    default:
      page = <NotFound />;
  }
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      {section !== "welcome" ? (
        <div className="app-shell">
          <aside className={cn("sidebar", menu && "menu-open")}>
            <Brand />
            <div className="workspace">
              <span className="workspace-emoji">
                <Astronaut size={29} />
              </span>
              <div>
                <strong>The good company</strong>
                <span>Your private space</span>
              </div>
              <span className="workspace-dot" />
            </div>
            <span className="nav-label">YOUR SPACE</span>
            <nav aria-label="Main navigation">
              {nav.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  aria-current={
                    section === n.id ||
                    (section === "crew" && n.id === "crews") ||
                    (section === "challenge" && n.id === "challenges")
                      ? "page"
                      : undefined
                  }
                  className={cn(
                    "nav-item",
                    (section === n.id ||
                      (section === "crew" && n.id === "crews") ||
                      (section === "challenge" && n.id === "challenges")) &&
                      "active",
                  )}
                >
                  <n.icon size={19} />
                  <span>{n.label}</span>
                  {n.id === "today" && <span className="nav-counter">1</span>}
                </a>
              ))}
            </nav>
            <div className="sidebar-crews">
              <div className="nav-label">
                YOUR CREWS
                <button
                  className="icon-button"
                  aria-label="Create a crew"
                  onClick={() => setModal("crew")}
                >
                  <Plus size={15} />
                </button>
              </div>
              {state.crews.map((c) => (
                <a key={c.id} href={`#crew/${c.id}`} className="sidebar-crew">
                  <span className={`crew-dot ${c.color}`} />
                  <span>{c.name}</span>
                  <span>{c.members}</span>
                </a>
              ))}
            </div>
            <div className="sidebar-bottom">
              <a
                href="#lab"
                className={cn("design-lab-link", section === "lab" && "active")}
              >
                <span className="design-lab-icon">
                  <Palette size={19} />
                </span>
                <div>
                  <strong>Design Lab</strong>
                  <span>3 looks. Find your vibe.</span>
                </div>
                <ArrowUpRight size={15} />
              </a>
              <a href="#profile" className="sidebar-profile">
                <span className="avatar mint">
                  <Astronaut size={32} />
                </span>
                <div>
                  <strong>{state.name}</strong>
                  <span>Just getting better.</span>
                </div>
                <Settings size={17} />
              </a>
            </div>
          </aside>
          <div className="app-area">
            <header className="topbar">
              <div className="breadcrumbs">
                <button
                  className="icon-button mobile-menu"
                  aria-label="Toggle navigation menu"
                  aria-expanded={menu}
                  onClick={() => setMenu(!menu)}
                >
                  {menu ? <X size={20} /> : <Menu size={20} />}
                </button>
                <span>My space</span>
                <span>/</span>
                <strong>
                  {section === "lab"
                    ? "Design Lab"
                    : section === "profile"
                      ? "Your profile"
                      : section === "crew"
                        ? "Crew lobby"
                        : section === "challenge"
                          ? "Mission details"
                          : nav.find((n) => n.id === section)?.label ||
                            "Welcome"}
                </strong>
              </div>
              <div className="topbar-actions">
                <div className="theme-switcher" aria-label="UI variations">
                  {(Object.keys(themes) as Theme[]).map((t) => (
                    <button
                      key={t}
                      aria-label={themes[t].name}
                      onClick={() => update({ theme: t })}
                      aria-pressed={state.theme === t}
                      title={themes[t].name}
                      className={state.theme === t ? "selected" : ""}
                    >
                      <span>{themes[t].icon}</span>
                      <span>{themes[t].name}</span>
                    </button>
                  ))}
                </div>
                <a className="topbar-lab" href="#lab">
                  Compare journeys <ArrowUpRight size={14} />
                </a>
                <span className="avatar mint topbar-avatar">
                  <Astronaut size={29} />
                </span>
              </div>
            </header>
            <main
              id="main"
              tabIndex={-1}
              className={cn("main-content", section === "lab" && "lab-content")}
            >
              {storageError && (
                <p className="error" role="alert">
                  Browser storage is unavailable. Changes will last for this
                  session only.
                </p>
              )}
              {page}
              <footer className="footer">
                <span>
                  <span className="status-dot" /> LOCAL PROTOTYPE{" "}
                  <span className="footer-separator">/</span> MADE FOR THE BOYS.
                </span>
                <a href="#lab">
                  Explore all 3 designs <ArrowUpRight size={13} />
                </a>
              </footer>
            </main>
          </div>
          <nav className="mobile-bottom" aria-label="Mobile navigation">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={section === n.id ? "active" : ""}
              >
                <n.icon size={20} />
                <span>
                  {n.id === "rankings"
                    ? "Ranks"
                    : n.id === "crews"
                      ? "Crew"
                      : n.label}
                </span>
              </a>
            ))}
            <a href="#lab" className={section === "lab" ? "active" : ""}>
              <Palette size={20} />
              <span>Design Lab</span>
            </a>
          </nav>
        </div>
      ) : (
        <main id="main" tabIndex={-1} className="welcome-page">
          <div className="welcome-header">
            <Brand />
            <div className="theme-switcher">
              {(Object.keys(themes) as Theme[]).map((t) => (
                <button
                  key={t}
                  aria-pressed={state.theme === t}
                  className={state.theme === t ? "selected" : ""}
                  onClick={() => update({ theme: t })}
                >
                  {themes[t].icon} {themes[t].name}
                </button>
              ))}
            </div>
          </div>
          {page}
        </main>
      )}
      <Checkin
        open={modal === "checkin"}
        onClose={() => setModal("")}
        done={state.lastDay === dayKey()}
        streak={currentStreak(state)}
        crew={state.crews[0]?.name || "Your crew"}
        onSubmit={(note, hasPhoto) =>
          setState((old) => {
            if (old.lastDay === dayKey()) return old;
            return {
              ...recordCheckin(old),
              entries: [
                { id: crypto.randomUUID(), day: dayKey(), note, hasPhoto },
                ...old.entries,
              ],
            };
          })
        }
      />
      <CreationModal
        kind={modal.startsWith("challenge") ? "challenge" : "crew"}
        open={modal === "crew" || modal.startsWith("challenge")}
        crewId={modal.split(":")[1]}
        state={state}
        onClose={() => setModal("")}
        onCreate={(s, r) => {
          update(s);
          setModal("");
          go(r);
          notify(
            r.startsWith("crew")
              ? "Your lobby is ready. Bring the boys."
              : "Mission created. You’re the first one in.",
          );
        }}
      />
      <JoinModal
        open={modal === "join"}
        state={state}
        onClose={() => setModal("")}
        onJoin={(id) => {
          setModal("");
          go(`crew/${id}`);
          notify("You’re in. Welcome to the lobby.");
        }}
      />
      <Modal
        open={modal.startsWith("invite:")}
        onClose={() => setModal("")}
        title="Save the boys a spot."
        description="Copy an invite for this prototype’s crew lobby."
      >
        <InviteContent state={state} id={modal.split(":")[1]} notify={notify} />
      </Modal>
      <Modal
        open={modal === "restart"}
        onClose={() => setModal("")}
        title="A fresh start counts."
        description="Restart your current streak at zero. Your personal best and previous check-ins stay with you."
      >
        <div className="restart-copy">
          <Astronaut size={90} />
          <p>
            Progress isn’t a straight line.
            <br />
            The crew’s still in your corner.
          </p>
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={() => setModal("")}>
            Keep my streak
          </button>
          <button
            className="button primary"
            onClick={() => {
              update({ streak: 0, lastDay: "" });
              setModal("");
              notify("Fresh start. Your best streak is still yours.");
            }}
          >
            Start fresh <ArrowRight size={16} />
          </button>
        </div>
      </Modal>
      <Modal
        open={modal === "install"}
        onClose={() => setModal("")}
        title="Give the crew a home."
        description="Install LOCKED IN from your browser for a full-screen app experience."
      >
        <ol className="install-steps">
          <li>
            <strong>On iPhone</strong>
            <p>Open in Safari → Share → Add to Home Screen.</p>
          </li>
          <li>
            <strong>On Android or desktop Chrome</strong>
            <p>Open the browser menu → Install app or Add to Home screen.</p>
          </li>
        </ol>
        <p className="fineprint">
          The production build supports an offline app shell. Shared accounts
          and notifications will need the backend.
        </p>
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
function CreationModal({
  kind,
  open,
  onClose,
  state,
  crewId,
  onCreate,
}: {
  kind: "crew" | "challenge";
  open: boolean;
  onClose: () => void;
  state: State;
  crewId?: string;
  onCreate: (s: Partial<State>, route: string) => void;
}) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") || "").trim();
    if (!name) return;
    const id = crypto.randomUUID();
    if (kind === "crew") {
      onCreate(
        {
          crews: [
            ...state.crews,
            {
              id,
              name,
              description:
                String(
                  d.get("description") || "A little better, together.",
                ).trim() || "A little better, together.",
              members: 1,
              color: String(d.get("color")),
              code: crypto.randomUUID().slice(0, 6).toUpperCase(),
            },
          ],
        },
        `crew/${id}`,
      );
    } else {
      const c = {
        id,
        title: name,
        description:
          String(d.get("description") || "One day at a time.").trim() ||
          "One day at a time.",
        days: Number(d.get("days")),
        members: 1,
        joined: true,
        kind: String(d.get("kind")),
        crewId: String(d.get("crew")),
      };
      onCreate({ challenges: [...state.challenges, c] }, `challenge/${id}`);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        kind === "crew" ? "Good company starts here." : "Make a little promise."
      }
      description={
        kind === "crew"
          ? "Create a private lobby for your people."
          : "Anyone can start a mission. Keep the rules simple."
      }
    >
      <form
        className="creation-form"
        onSubmit={submit}
        key={open ? `${kind}-${crewId}` : "closed"}
      >
        <label className="field">
          {kind === "crew" ? "Crew name" : "Challenge name"}
          <input
            name="name"
            required
            maxLength={40}
            pattern=".*\S.*"
            placeholder={
              kind === "crew" ? "The good company…" : "The 7-day reset…"
            }
            autoComplete="off"
          />
        </label>
        <label className="field">
          {kind === "crew" ? "What’s the vibe?" : "The promise"}
          <textarea
            name="description"
            maxLength={180}
            rows={2}
            placeholder="One day at a time, together…"
          />
        </label>
        {kind === "crew" ? (
          <label className="field">
            Crew color
            <select name="color">
              <option value="mint">Fresh mint</option>
              <option value="lilac">Soft lilac</option>
              <option value="peach">Peach club</option>
              <option value="blue">Orbit blue</option>
            </select>
          </label>
        ) : (
          <>
            <div className="form-row">
              <label className="field">
                Duration
                <select name="days">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                </select>
              </label>
              <label className="field">
                Type
                <select name="kind">
                  <option>Abstinence</option>
                  <option>Digital reset</option>
                  <option>Daily habit</option>
                </select>
              </label>
            </div>
            <label className="field">
              Crew
              <select name="crew" defaultValue={crewId || state.crews[0]?.id}>
                {state.crews.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button type="submit" className="button primary full">
          {kind === "crew" ? "Create the lobby" : "Start the mission"}
          <ArrowRight size={17} />
        </button>
        <p className="fineprint">
          Saved on this device. Real invitations and shared progress are part of
          the backend phase.
        </p>
      </form>
    </Modal>
  );
}
function JoinModal({
  open,
  onClose,
  onJoin,
  state,
}: {
  open: boolean;
  onClose: () => void;
  onJoin: (id: string) => void;
  state: State;
}) {
  const [error, setError] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your spot’s waiting."
      description="Enter a crew’s invite code to open its lobby."
    >
      <form
        className="creation-form"
        onSubmit={(e) => {
          e.preventDefault();
          const code = String(new FormData(e.currentTarget).get("code"))
            .trim()
            .toUpperCase();
          const c = state.crews.find((c) => c.code === code);
          if (c) {
            setError("");
            onJoin(c.id);
          } else
            setError(
              "That code isn’t in this demo. Try BOYS24 or a crew you created.",
            );
        }}
      >
        <label className="field">
          Invite code
          <input
            name="code"
            placeholder="BOYS24…"
            required
            maxLength={12}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "invite-error" : undefined}
          />
        </label>
        {error && (
          <p className="error" id="invite-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary full">
          Enter the lobby <ArrowRight size={17} />
        </button>
        <p className="fineprint">
          Demo code: BOYS24. Codes created here work only on this device.
        </p>
      </form>
    </Modal>
  );
}
function InviteContent({
  state,
  id,
  notify,
}: {
  state: State;
  id: string;
  notify: (s: string) => void;
}) {
  const c = state.crews.find((c) => c.id === id);
  if (!c) return null;
  const url = `${location.origin}${location.pathname}#invite/${c.code}`;
  return (
    <div className="invite-content">
      <div className="invite-ticket">
        <Astronaut size={75} />
        <h3>{c.name}</h3>
        <span className="eyebrow">YOUR LOBBY CODE</span>
        <strong className="display">{c.code}</strong>
      </div>
      <button
        className="button primary full"
        onClick={() =>
          navigator.clipboard
            .writeText(url)
            .then(() => notify("Demo invite link copied."))
            .catch(() => notify(`Copy this code: ${c.code}`))
        }
      >
        <Copy size={17} /> Copy invite link
      </button>
      <label className="field">
        Or copy manually
        <input value={url} readOnly onFocus={(e) => e.target.select()} />
      </label>
      <p className="fineprint">
        Preview only: this link opens a locally stored crew. It won’t sync to a
        friend’s device until shared storage is connected.
      </p>
    </div>
  );
}
function JoinLanding({ state, go, open, code }: PageProps & { code: string }) {
  const c = state.crews.find((c) => c.code === code?.toUpperCase());
  return (
    <div className="empty-state">
      <Astronaut size={120} hat />
      <span className="pill mint">YOU’RE INVITED</span>
      <h1 className="display">
        {c ? `${c.name} saved you a spot.` : "Your next crew is out there."}
      </h1>
      <p>
        {c
          ? "A private lobby. A little accountability. A good reason to show up."
          : "This invitation isn’t stored on this device. Try the sample crew with BOYS24."}
      </p>
      <button
        className="button primary"
        onClick={() => (c ? go(`crew/${c.id}`) : open("join"))}
      >
        {c ? "Enter the lobby" : "Enter a demo code"} <ArrowRight size={18} />
      </button>
      <p className="fineprint">
        Local invitation preview · no account or membership is created.
      </p>
    </div>
  );
}

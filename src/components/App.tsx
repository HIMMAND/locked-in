"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Check,
  Plus,
  Users,
  Flame,
  Trophy,
  Camera,
  LogOut,
  Copy,
  X,
  Trash2,
  LoaderCircle,
  ShieldCheck,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { User, Crew, CrewView, ChallengeView } from "@/lib/types";
import { addDays } from "@/lib/streak.mjs";
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/" + path, {
    ...options,
    cache: "no-store",
    headers:
      options.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options.headers },
  });
  const data = (await response.json()) as T & {
    error?: string;
    message?: string;
  };
  if (!response.ok)
    throw Object.assign(
      new Error(data.error || data.message || "Please try again."),
      { status: response.status },
    );
  return data;
}
function Crewmate({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 70" aria-hidden="true">
      <path
        d="M14 31H8v24h8"
        fill="#6c9e86"
        stroke="#bedcc8"
        strokeWidth="2.5"
      />
      <path
        d="M17 61V28c0-12 6-19 18-19s19 8 19 21v31H40V50H29v11Z"
        fill="#8ab89e"
        stroke="#bedcc8"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="29"
        y="22"
        width="28"
        height="17"
        rx="7"
        fill="#dcecf0"
        stroke="#456a60"
        strokeWidth="3"
      />
      <path d="M35 26h13" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content
          className="modal"
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <div className="modal-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            {title} for your private crew.
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function Auth({
  onDone,
  invited,
}: {
  onDone: () => Promise<void>;
  invited: boolean;
}) {
  const [signup, setSignup] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const email = String(form.get("email")).trim();
      const password = String(form.get("password"));
      const result = signup
        ? await authClient.signUp.email({
            email,
            password,
            name: String(form.get("name")).trim(),
          })
        : await authClient.signIn.email({ email, password });
      if (result.error)
        throw new Error(result.error.message || "Could not sign in.");
      await onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="auth-page">
      <a href="/" className="brand">
        <Crewmate size={32} />
        LOCKED IN.
      </a>
      <div className="auth-card">
        <div className="auth-intro">
          <Crewmate size={78} />
          <h1>{signup ? "Join the crew." : "Stay in. Together."}</h1>
          <p>
            {invited
              ? "Your crew sent you an invite. Sign in to join."
              : "A small promise. A little help from your friends."}
          </p>
        </div>
        <form onSubmit={submit}>
          {signup && (
            <label>
              Your name
              <input
                name="name"
                autoComplete="nickname"
                maxLength={24}
                required
                pattern=".*\S.*"
                placeholder="What do your friends call you?"
              />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 10 : 1}
              maxLength={128}
              required
              placeholder={signup ? "At least 10 characters" : "Your password"}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={pending}>
            {pending ? <LoaderCircle className="spin" size={17} /> : null}
            {signup ? "Create account" : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>
        <button
          className="auth-toggle"
          onClick={() => {
            setSignup(!signup);
            setError("");
          }}
        >
          {signup
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </div>
      <p className="auth-foot">Your pace. Your people.</p>
    </main>
  );
}
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a photo.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose a photo smaller than 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.8, 0.6, 0.4, 0.2]) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );
      if (blob && blob.size <= 262144)
        return new File([blob], "checkin.jpg", { type: "image/jpeg" });
    }
    throw new Error("That photo is too detailed. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}
export default function App({ inviteCode }: { inviteCode?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crew, setCrew] = useState<CrewView | null>(null);
  const [detail, setDetail] = useState<ChallengeView | null>(null);
  const [tab, setTab] = useState<"today" | "crew" | "ranks">("today");
  const [modal, setModal] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [invite, setInvite] = useState("");
  const [online, setOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const selected = useRef({ crew: "", challenge: "" });
  const requestId = useRef(0);
  const inviteShown = useRef(false);
  async function refresh(crewId?: string, challengeId?: string) {
    const ticket = ++requestId.current;
    setRefreshing(true);
    try {
      const data = await api<{ user: User; crews: Crew[] }>("state");
      if (ticket !== requestId.current) return;
      setUser(data.user);
      setCrews(data.crews);
      const c =
        data.crews.find((c) => c.id === (crewId ?? selected.current.crew)) ||
        data.crews[0];
      if (!c) {
        setCrew(null);
        setDetail(null);
        selected.current = { crew: "", challenge: "" };
      } else {
        const view = await api<CrewView>(`crews/${c.id}`);
        if (ticket !== requestId.current) return;
        const ch =
          view.challenges.find(
            (ch) => ch.id === (challengeId ?? selected.current.challenge),
          ) ||
          view.challenges.find((ch) => ch.endDay >= view.today) ||
          view.challenges[0];
        const details = ch
          ? await api<ChallengeView>(`challenges/${ch.id}`)
          : null;
        if (ticket !== requestId.current) return;
        setCrew(view);
        setDetail(details);
        selected.current = { crew: c.id, challenge: ch?.id || "" };
      }
      if (inviteCode && !inviteShown.current) {
        inviteShown.current = true;
        setModal("join");
        setInvite(inviteCode);
      }
      setError("");
    } catch (e) {
      if (ticket !== requestId.current) return;
      if ((e as { status?: number }).status === 401) {
        setUser(null);
        setCrew(null);
        setDetail(null);
      } else setError((e as Error).message);
    } finally {
      if (ticket === requestId.current) {
        setReady(true);
        setRefreshing(false);
      }
    }
  }
  useEffect(() => {
    setHydrated(true);
    try {
      localStorage.removeItem("locked-in-v1");
    } catch {}
    void refresh();
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker.register("/sw.js");
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    const sync = () => {
      if (
        document.visibilityState === "visible" &&
        navigator.onLine &&
        selected.current.crew
      )
        void refresh();
    };
    document.addEventListener("visibilitychange", sync);
    const timer = window.setInterval(sync, 60000);
    return () => {
      requestId.current++;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, []);
  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function open(name: string) {
    setError("");
    setPhoto(null);
    setModal(name);
  }
  async function run(action: () => Promise<void>) {
    setPending(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  const me = detail?.rankings.find((p) => p.id === user?.id);
  const ended = detail ? crew!.today > detail.challenge.endDay : false;
  const joined = detail?.challenge.joined;
  const timezone = crew?.crew.timezone || "UTC";
  async function joinChallenge() {
    if (!detail) return;
    await api(`challenges/${detail.challenge.id}/join`, {
      method: "POST",
      body: "{}",
    });
    await refresh();
    setNotice("You’re in. Your first check-in starts today.");
  }
  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run(async () => {
      if (modal === "create") {
        const data = await api<{ id: string }>("crews", {
          method: "POST",
          body: JSON.stringify({
            name: form.get("name"),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
        setModal("");
        await refresh(data.id, "");
        setNotice("Crew created. Invite your friends.");
      } else if (modal === "join") {
        let code = String(form.get("code")).trim();
        try {
          code =
            new URL(code).pathname.split("/").filter(Boolean).at(-1) || code;
        } catch {}
        const data = await api<{ id: string }>("join", {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        setModal("");
        if (inviteCode) history.replaceState(null, "", "/");
        await refresh(data.id, "");
        setNotice("Welcome to the crew.");
      } else if (modal === "challenge" && crew) {
        const data = await api<{ id: string }>(
          `crews/${crew.crew.id}/challenges`,
          {
            method: "POST",
            body: JSON.stringify({
              name: form.get("name"),
              description: form.get("description"),
              days: Number(form.get("days")),
            }),
          },
        );
        setModal("");
        setTab("today");
        await refresh(crew.crew.id, data.id);
      } else if (modal === "checkin" && detail) {
        form.delete("photo");
        if (photo) form.set("photo", photo);
        await api(`challenges/${detail.challenge.id}/checkins`, {
          method: "POST",
          body: form,
        });
        setModal("");
        setPhoto(null);
        await refresh();
        setNotice("Checked in. See you tomorrow.");
      } else if (modal === "account") {
        const response = await authClient.updateUser({
          name: String(form.get("name")).trim(),
        });
        if (response.error) throw new Error(response.error.message);
        setModal("");
        await refresh();
        setNotice("Name updated.");
      } else if (modal === "password") {
        const response = await authClient.changePassword({
          currentPassword: String(form.get("current")),
          newPassword: String(form.get("password")),
          revokeOtherSessions: true,
        });
        if (response.error) throw new Error(response.error.message);
        setModal("");
        setNotice("Password changed. Other devices have been signed out.");
      }
    });
  }
  if (!ready || !hydrated)
    return (
      <div className="loading">
        <Crewmate size={48} />
        <span>Opening your crew…</span>
      </div>
    );
  if (!user)
    return error ? (
      <main className="loading">
        <p className="error" role="alert">
          {error}
        </p>
        <button className="button" onClick={() => void refresh()}>
          Try again
        </button>
      </main>
    ) : (
      <Auth onDone={refresh} invited={!!inviteCode} />
    );
  const modalTitle =
    modal === "create"
      ? "Start a crew"
      : modal === "join"
        ? "Join your friends"
        : modal === "challenge"
          ? "New challenge"
          : modal === "checkin"
            ? "Still in today?"
            : modal === "invite"
              ? "Invite the crew"
              : modal === "account"
                ? "Your account"
                : modal === "password"
                  ? "Change password"
                  : modal === "leave"
                    ? "Leave this crew?"
                    : "Delete this check-in?";
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="header">
        <a href="/" className="brand">
          <Crewmate size={30} />
          LOCKED IN.
        </a>
        <div className="header-right">
          <button className="profile-button" onClick={() => open("account")}>
            <Avatar name={user.name} />
            <span>{user.name}</span>
          </button>
          <button
            className="icon-button"
            aria-label="Sign out"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const r = await authClient.signOut();
                if (r.error) throw new Error(r.error.message);
                setUser(null);
                setCrews([]);
                setCrew(null);
                setDetail(null);
              })
            }
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main id="content" className="container">
        <div className="crew-toolbar">
          <label className="crew-select">
            <Users size={16} />
            <select
              aria-label="Your crew"
              value={crew?.crew.id || ""}
              disabled={!crews.length || refreshing}
              onChange={(e) => void refresh(e.target.value, "")}
            >
              <option value="" disabled>
                Your crew
              </option>
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="toolbar-actions">
            <button className="text-button" onClick={() => open("join")}>
              Join a crew
            </button>
            <button className="button small" onClick={() => open("create")}>
              <Plus size={15} /> New crew
            </button>
          </div>
        </div>
        {!online && (
          <p className="error" role="status">
            You’re offline. Reconnect to check in.
          </p>
        )}
        {error && !modal && (
          <div className="error" role="alert">
            {error}
            <button className="text-button" onClick={() => void refresh()}>
              Try again
            </button>
          </div>
        )}
        {!crew ? (
          <section className="empty welcome-empty">
            <Crewmate size={95} />
            <h1>Better with your people.</h1>
            <p>
              Create a private crew or join a friend’s.
              <br />
              The first day starts with you.
            </p>
            <div>
              <button className="button primary" onClick={() => open("create")}>
                Create a crew <ArrowRight size={17} />
              </button>
              <button className="button" onClick={() => open("join")}>
                I have an invite
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="page-title">
              <div>
                <span className="eyebrow">YOUR PRIVATE CREW</span>
                <h1>{crew.crew.name}</h1>
                <p>
                  {crew.members.length}{" "}
                  {crew.members.length === 1 ? "member" : "members"}{" "}
                  <span>·</span> One day at a time.
                </p>
              </div>
              <button
                className="icon-button"
                aria-label="Refresh crew"
                disabled={refreshing}
                onClick={() => void refresh()}
              >
                <RefreshCw size={17} className={refreshing ? "spin" : ""} />
              </button>
            </div>
            <nav className="tabs" aria-label="Crew pages">
              {(
                [
                  { id: "today", label: "Today" },
                  { id: "crew", label: "Crew" },
                  { id: "ranks", label: "Leaderboard" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={tab === t.id ? "active" : ""}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            {tab !== "crew" && crew.challenges.length > 0 && (
              <div className="challenge-select">
                <label>
                  <span className="sr-only">Current challenge</span>
                  <select
                    aria-label="Current challenge"
                    value={detail?.challenge.id || ""}
                    disabled={refreshing}
                    onChange={(e) => void refresh(crew.crew.id, e.target.value)}
                  >
                    {crew.challenges.map((ch) => (
                      <option value={ch.id} key={ch.id}>
                        {ch.name}
                        {ch.endDay < crew.today ? " · finished" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <span>{detail?.challenge.days} days</span>
              </div>
            )}
            {tab === "today" && (
              <>
                {!detail ? (
                  <section className="empty">
                    <Flame size={35} />
                    <h2>Make your first promise.</h2>
                    <p>Anyone in the crew can start a challenge.</p>
                    <button
                      className="button primary"
                      onClick={() => open("challenge")}
                    >
                      Create a challenge <Plus size={16} />
                    </button>
                  </section>
                ) : (
                  <>
                    <section className="checkin-card">
                      <div className="checkin-info">
                        <span className="eyebrow">
                          {ended
                            ? "CHALLENGE COMPLETE"
                            : me?.checkedIn
                              ? "TODAY’S PROMISE KEPT"
                              : "YOUR DAILY CHECK-IN"}
                        </span>
                        <h2>
                          {ended
                            ? "Look at you go."
                            : me?.checkedIn
                              ? "Another day. Locked in."
                              : joined
                                ? "Small promise. Keep it."
                                : "Make the promise yours."}
                        </h2>
                        <p>{detail.challenge.description}</p>
                        <span className="time-note">
                          Daily cutoff: midnight ·{" "}
                          {timezone.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="streak-stat">
                        <Flame size={22} />
                        <strong>{me?.current || 0}</strong>
                        <span>day streak</span>
                      </div>
                      <div className="checkin-action">
                        {ended ? (
                          <button
                            className="button"
                            onClick={() => open("challenge")}
                          >
                            Start another challenge <Plus size={16} />
                          </button>
                        ) : !joined ? (
                          <button
                            className="button primary full"
                            disabled={pending || refreshing || !online}
                            onClick={() => void run(joinChallenge)}
                          >
                            Join challenge <ArrowRight size={17} />
                          </button>
                        ) : (
                          <button
                            className={`button full ${me?.checkedIn ? "done" : "primary"}`}
                            disabled={
                              me?.checkedIn || pending || refreshing || !online
                            }
                            onClick={() => open("checkin")}
                          >
                            {me?.checkedIn ? (
                              <>
                                <Check size={18} /> Checked in today
                              </>
                            ) : (
                              <>
                                I’m still in <ArrowRight size={17} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </section>
                    {joined && (
                      <div
                        className="week"
                        aria-label="Your last seven check-in days"
                      >
                        {Array.from({ length: 7 }, (_, i) => {
                          const day = addDays(crew.today, i - 6);
                          const checked = detail.myDays.includes(day);
                          return (
                            <div className={checked ? "checked" : ""} key={day}>
                              <span>
                                {new Intl.DateTimeFormat("en", {
                                  weekday: "short",
                                  timeZone: "UTC",
                                }).format(new Date(day + "T12:00:00Z"))}
                              </span>
                              <div
                                aria-label={`${day}${checked ? " checked in" : " no check-in"}`}
                              >
                                {checked ? (
                                  <Check size={16} />
                                ) : (
                                  <span className="day-dot" />
                                )}
                              </div>
                              <small>{i === 6 ? "Today" : day.slice(-2)}</small>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <section className="feed">
                      <div className="section-heading">
                        <h2>From the crew</h2>
                        <span>
                          {detail.rankings.filter((p) => p.checkedIn).length}/
                          {detail.rankings.length} checked in today
                        </span>
                      </div>
                      {detail.feed.length === 0 ? (
                        <p className="quiet-empty">
                          No check-ins yet. Yours could be the first.
                        </p>
                      ) : (
                        detail.feed.map((entry) => (
                          <article className="feed-row" key={entry.id}>
                            <Avatar name={entry.name} />
                            <div className="feed-body">
                              <div>
                                <strong>{entry.name}</strong>
                                <time
                                  dateTime={new Date(
                                    entry.createdAt,
                                  ).toISOString()}
                                >
                                  {new Intl.DateTimeFormat("en", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    timeZone: timezone,
                                  }).format(new Date(entry.createdAt))}
                                </time>
                              </div>
                              {entry.note && <p>{entry.note}</p>}
                              {entry.hasPhoto && (
                                <a
                                  href={`/api/photos/${entry.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Open ${entry.name}’s check-in photo`}
                                >
                                  <img
                                    src={`/api/photos/${entry.id}`}
                                    width="260"
                                    height="195"
                                    loading="lazy"
                                    alt={`${entry.name}’s daily check-in`}
                                  />
                                </a>
                              )}
                            </div>
                            {entry.userId === user.id && (
                              <button
                                className="icon-button"
                                aria-label="Delete your check-in"
                                onClick={() => open(`delete:${entry.id}`)}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </article>
                        ))
                      )}
                    </section>
                  </>
                )}
              </>
            )}
            {tab === "ranks" && (
              <section className="leaderboard">
                {!detail ? (
                  <div className="empty">
                    <Trophy size={36} />
                    <h2>A friendly race starts here.</h2>
                    <p>Create a challenge to start your leaderboard.</p>
                    <button
                      className="button primary"
                      onClick={() => open("challenge")}
                    >
                      Create a challenge
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="section-heading">
                      <h2>A little friendly competition.</h2>
                      <Trophy size={19} />
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Rank</th>
                          <th scope="col">Member</th>
                          <th scope="col">Streak</th>
                          <th scope="col">Total days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.rankings.map((p, i) => (
                          <tr
                            className={p.id === user.id ? "you" : ""}
                            key={p.id}
                          >
                            <td>{i + 1}</td>
                            <th scope="row">
                              <Avatar name={p.name} />
                              {p.name}
                              {p.id === user.id && (
                                <span className="you-label">you</span>
                              )}
                            </th>
                            <td>{p.current}</td>
                            <td>{p.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="fineprint">
                      Ranked by current streak, then total check-ins. All
                      check-ins are self-reported.
                    </p>
                  </>
                )}
              </section>
            )}
            {tab === "crew" && (
              <div className="crew-panel">
                <section>
                  <div className="section-heading">
                    <h2>
                      Your people{" "}
                      <span className="count">{crew.members.length}</span>
                    </h2>
                    {crew.crew.ownerId === user.id && (
                      <button
                        className="button small"
                        onClick={() => open("invite")}
                      >
                        <LinkIcon size={14} /> Invite friends
                      </button>
                    )}
                  </div>
                  <div className="members">
                    {crew.members.map((member) => (
                      <div className="member" key={member.id}>
                        <Avatar name={member.name} />
                        <strong>{member.name}</strong>
                        {member.id === crew.crew.ownerId && <span>owner</span>}
                      </div>
                    ))}
                  </div>
                </section>
                <section className="challenge-list">
                  <div className="section-heading">
                    <h2>Challenges</h2>
                    <button
                      className="text-button"
                      onClick={() => open("challenge")}
                    >
                      <Plus size={16} /> New challenge
                    </button>
                  </div>
                  {crew.challenges.length === 0 ? (
                    <p className="quiet-empty">
                      No challenges yet. Start something together.
                    </p>
                  ) : (
                    crew.challenges.map((ch) => (
                      <button
                        className="challenge-row"
                        key={ch.id}
                        onClick={() => {
                          setTab("today");
                          void refresh(crew.crew.id, ch.id);
                        }}
                      >
                        <span>
                          <strong>{ch.name}</strong>
                          <small>
                            {ch.days} days · {ch.participants} joined
                            {ch.endDay < crew.today ? " · finished" : ""}
                          </small>
                        </span>
                        <ArrowRight size={16} />
                      </button>
                    ))
                  )}
                </section>
                <p className="fineprint">
                  <ShieldCheck size={14} /> Only your crew can see its members,
                  check-ins and photos.
                </p>
                {crew.crew.ownerId !== user.id && (
                  <button
                    className="text-button danger"
                    onClick={() => open("leave")}
                  >
                    Leave crew
                  </button>
                )}
              </div>
            )}
          </>
        )}
        <footer>
          For the boys. For yourself.<span>LOCKED IN.</span>
        </footer>
      </main>
      <Modal
        open={!!modal}
        title={modalTitle}
        onClose={() => {
          if (!pending) setModal("");
        }}
      >
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {[
          "create",
          "join",
          "challenge",
          "checkin",
          "account",
          "password",
        ].includes(modal) && (
          <form onSubmit={submitForm} key={modal}>
            {modal === "create" && (
              <>
                <p className="muted">
                  A private space for you and your friends.
                </p>
                <label>
                  Crew name
                  <input
                    name="name"
                    required
                    maxLength={40}
                    pattern=".*\S.*"
                    placeholder="Name your crew"
                    autoComplete="off"
                  />
                </label>
                <p className="fineprint">
                  Your crew will use{" "}
                  {Intl.DateTimeFormat()
                    .resolvedOptions()
                    .timeZone.replaceAll("_", " ")}{" "}
                  time for its daily cutoff.
                </p>
              </>
            )}
            {modal === "join" && (
              <>
                <p className="muted">
                  Paste the invite link or code your friend sent you.
                </p>
                <label>
                  Invite link or code
                  <input
                    name="code"
                    required
                    defaultValue={invite}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Paste your invite"
                  />
                </label>
              </>
            )}
            {modal === "challenge" && (
              <>
                <label>
                  Challenge name
                  <input
                    name="name"
                    required
                    maxLength={40}
                    pattern=".*\S.*"
                    placeholder="What are we calling it?"
                    autoComplete="off"
                  />
                </label>
                <label>
                  The promise
                  <textarea
                    name="description"
                    required
                    maxLength={240}
                    rows={3}
                    placeholder="What are we committing to?"
                  />
                </label>
                <label>
                  Duration
                  <select name="days" defaultValue="30">
                    {[7, 14, 30, 60, 90].map((d) => (
                      <option key={d} value={d}>
                        {d} days
                      </option>
                    ))}
                  </select>
                </label>
                <p className="fineprint">
                  Starts today for {crew?.crew.name}. One honest check-in per
                  day.
                </p>
              </>
            )}
            {modal === "checkin" && (
              <>
                <p className="muted">
                  An ordinary moment from your day, or a quick note.
                </p>
                <label className="photo-upload">
                  {preview ? (
                    <img
                      src={preview}
                      width="320"
                      height="200"
                      alt="Selected check-in photo"
                    />
                  ) : (
                    <>
                      <Camera size={26} />
                      <span>
                        {photoBusy
                          ? "Preparing your photo…"
                          : "Add a photo (optional)"}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Choose check-in photo"
                    disabled={photoBusy || pending}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setPhotoBusy(true);
                      setError("");
                      try {
                        setPhoto(await compress(file));
                      } catch (error) {
                        setError((error as Error).message);
                      } finally {
                        setPhotoBusy(false);
                      }
                    }}
                  />
                </label>
                {photo && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setPhoto(null)}
                  >
                    Remove photo
                  </button>
                )}
                <label>
                  Your note
                  <textarea
                    name="note"
                    maxLength={280}
                    rows={3}
                    placeholder="How was today?"
                  />
                </label>
                <label className="checkbox">
                  <input name="honest" type="checkbox" value="true" required />{" "}
                  I kept my promise today. This is an honest check-in.
                </label>
                <p className="fineprint">
                  Shared with {crew?.crew.name}. Everyday photos only. A photo
                  shows participation, not proof of abstinence.
                </p>
              </>
            )}
            {modal === "account" && (
              <>
                <label>
                  Name
                  <input
                    name="name"
                    defaultValue={user.name}
                    required
                    pattern=".*\S.*"
                    maxLength={24}
                  />
                </label>
                <p className="muted">{user.email}</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => open("password")}
                >
                  Change password <ArrowRight size={15} />
                </button>
              </>
            )}
            {modal === "password" && (
              <>
                <label>
                  Current password
                  <input
                    name="current"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </label>
                <label>
                  New password
                  <input
                    name="password"
                    type="password"
                    minLength={10}
                    maxLength={128}
                    required
                    autoComplete="new-password"
                  />
                </label>
                <p className="fineprint">
                  At least 10 characters. Other devices will be signed out.
                </p>
              </>
            )}
            <button
              className="button primary full"
              disabled={pending || photoBusy || !online}
            >
              {pending && <LoaderCircle size={17} className="spin" />}
              {modal === "create"
                ? "Create crew"
                : modal === "join"
                  ? "Join crew"
                  : modal === "challenge"
                    ? "Start challenge"
                    : modal === "checkin"
                      ? "I’m still in"
                      : modal === "account"
                        ? "Save name"
                        : "Save password"}
              {!pending && <ArrowRight size={17} />}
            </button>
          </form>
        )}
        {modal === "invite" && crew && (
          <div className="invite-box">
            <p className="muted">
              Send this link to your friends. It expires 30 days after it’s
              created.
            </p>
            <label>
              Invite link
              <input
                readOnly
                value={`${location.origin}/join/${crew.crew.inviteCode}`}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <button
              className="button primary full"
              onClick={() =>
                void run(async () => {
                  await navigator.clipboard.writeText(
                    `${location.origin}/join/${crew.crew.inviteCode}`,
                  );
                  setNotice("Invite link copied.");
                })
              }
            >
              <Copy size={16} /> Copy link
            </button>
            <button
              className="text-button"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  await api(`crews/${crew.crew.id}/invite`, {
                    method: "POST",
                    body: "{}",
                  });
                  await refresh();
                  setNotice("New invite ready. The old link no longer works.");
                })
              }
            >
              Create a new link
            </button>
            <p className="fineprint">
              Creating a new link disables the previous invitation.
            </p>
          </div>
        )}
        {(modal.startsWith("delete:") || modal === "leave") && (
          <div className="confirm">
            <p>
              {modal === "leave"
                ? "Your check-ins in this crew will be deleted, and you’ll leave its challenges. You can rejoin with an invite."
                : "This removes the note and photo from your crew and recalculates your streak. This can’t be undone."}
            </p>
            <div>
              <button
                className="button"
                disabled={pending}
                onClick={() => setModal("")}
              >
                Cancel
              </button>
              <button
                className="button destructive"
                disabled={pending}
                onClick={() =>
                  void run(async () => {
                    if (modal === "leave") {
                      await api(`crews/${crew!.crew.id}/leave`, {
                        method: "POST",
                        body: "{}",
                      });
                      setModal("");
                      await refresh("", "");
                    } else {
                      await api(`checkins/${modal.split(":")[1]}`, {
                        method: "DELETE",
                      });
                      setModal("");
                      await refresh();
                    }
                  })
                }
              >
                {pending
                  ? "Saving…"
                  : modal === "leave"
                    ? "Leave crew"
                    : "Delete check-in"}
              </button>
            </div>
          </div>
        )}
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}

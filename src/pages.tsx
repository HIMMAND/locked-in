import { Children, useState, type ReactNode, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Clock,
  Flame,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  ChevronRight,
  Copy,
  LockKeyhole,
  Flag,
  Sun,
  Camera,
  MessageCircle,
  ArrowLeft,
  Orbit,
  CheckCircle2,
  CalendarDays,
  Link,
  Compass,
  Download,
} from "lucide-react";
import {
  Astronaut,
  AvatarStack,
  SectionTitle,
  Vault,
  cn,
} from "./components/Primitives";
import {
  themes,
  type State,
  type Theme,
  type Crew,
  type Challenge,
} from "./data";
import { currentStreak, dayKey } from "./streak.mjs";
export type PageProps = {
  state: State;
  update: (s: Partial<State>) => void;
  open: (name: string) => void;
  notify: (s: string) => void;
  go: (s: string) => void;
};
export function Today({ state, open }: PageProps) {
  const streak = currentStreak(state);
  const done = state.lastDay === dayKey();
  const active = state.challenges.filter((c) => c.joined);
  const isNight = state.theme === "night";
  const isClub = state.theme === "club";
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> YOUR DAILY DOSE OF SHOWING UP
          </div>
          <h1 className="display">
            {isNight
              ? "Stay on mission."
              : isClub
                ? "The lobby is open."
                : "Small promises."}
            <br />
            <span className="heading-muted">
              {isNight
                ? "Crew’s counting on you."
                : isClub
                  ? "Big up the little wins."
                  : "Stronger together."}
            </span>
          </h1>
          <p>
            {isNight
              ? "One daily task. A crew in your corner."
              : `Hey ${state.name.split(" ")[0]}, a better day starts with a little follow-through.`}
          </p>
        </div>
        <div className="date-chip">
          <CalendarDays size={16} />
          {new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            weekday: "short",
          }).format(new Date())}
        </div>
      </div>
      <div className="dashboard-grid">
        <OrderedMain theme={state.theme}>
          <section className="streak-hero">
            <div className="hero-top">
              <span className="pill glass">
                <Flame size={15} /> YOUR CURRENT STREAK
              </span>
              <span className="small-label">ONE DAY AT A TIME</span>
            </div>
            <div className="hero-center">
              <div className="streak-number">
                <span className="display">
                  {String(streak).padStart(2, "0")}
                </span>
                <span>
                  days
                  <br />
                  locked in.
                </span>
              </div>
              <Vault days={streak} />
            </div>
            <div className="hero-bottom">
              <span>
                <Sparkles size={15} />{" "}
                {streak < 7
                  ? `${7 - streak} more ${7 - streak === 1 ? "day" : "days"} to your next milestone`
                  : "A whole week. Look at you go."}
              </span>
              <span>
                Best: {state.best} days <ArrowUpRight size={13} />
              </span>
            </div>
          </section>
          <section className="daily-card">
            <div className="daily-title">
              <div className="task-icon">
                <CheckCheck size={22} />
              </div>
              <div>
                <h2>
                  {done ? "Task complete. Nice work." : "One task. All yours."}
                </h2>
                <p>
                  {done
                    ? "You showed up today. Take the win."
                    : "Take a moment. Check in. Keep the promise."}
                </p>
              </div>
              <span className={cn("pill", done ? "mint" : "peach")}>
                {done ? "Done for today" : "Daily check-in"}
              </span>
            </div>
            <div className="week-row">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 6 + i);
                const completed =
                  (i < 6 &&
                    i >=
                      6 - Math.min(Math.max(0, streak - (done ? 1 : 0)), 6)) ||
                  (i === 6 && done);
                return (
                  <div
                    key={i}
                    className={cn(
                      "day-cell",
                      completed && "complete",
                      i === 6 && "today",
                    )}
                  >
                    <span>
                      {new Intl.DateTimeFormat("en", {
                        weekday: "short",
                      }).format(d)}
                    </span>
                    <div>
                      {completed ? (
                        <Check size={18} />
                      ) : i === 6 ? (
                        <span className="tiny-dot" />
                      ) : (
                        <span>–</span>
                      )}
                    </div>
                    <small>
                      {i === 6
                        ? "Today"
                        : new Intl.DateTimeFormat("en", {
                            day: "numeric",
                          }).format(d)}
                    </small>
                  </div>
                );
              })}
            </div>
            <button
              className={cn("button full", done ? "secondary" : "primary")}
              onClick={() => open("checkin")}
            >
              {done ? "View today’s check-in" : "I’m still in"}
              {done ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
            </button>
            <div className="daily-caption">
              <ShieldCheck size={13} /> Honest check-ins. No judgment. Just the
              boys.
            </div>
          </section>
          <section>
            <SectionTitle title="Your active missions" href="#challenges" />
            <div className="active-missions">
              {active.length ? (
                active.map((c) => (
                  <a
                    href={`#challenge/${c.id}`}
                    key={c.id}
                    className="mission-row"
                  >
                    <span className="mission-icon">
                      <Flag size={23} />
                    </span>
                    <div className="mission-info">
                      <h3>{c.title}</h3>
                      <p>
                        {state.crews.find((g) => g.id === c.crewId)?.name ||
                          "Your crew"}{" "}
                        <span>·</span> {c.days} day challenge
                      </p>
                      <div className="progress-track">
                        <i
                          style={{
                            width: `${Math.min((streak / c.days) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="mission-days">
                      <strong>
                        {Math.min(streak, c.days)}
                        <small>/{c.days}</small>
                      </strong>
                      <span>days in</span>
                    </span>
                    <ChevronRight size={16} />
                  </a>
                ))
              ) : (
                <div className="empty-small">
                  No missions yet.{" "}
                  <a href="#challenges">Find your first challenge →</a>
                </div>
              )}
            </div>
          </section>
        </OrderedMain>
        <aside className="right-column">
          <section className="crew-card">
            <div className="section-title">
              <h2>The crew’s here.</h2>
              <span className="pill neutral">DEMO</span>
            </div>
            <div className="crew-lineup">
              {["mint", "lilac", "peach", "blue", "yellow"].map((c, i) => (
                <div key={c} className="crew-person">
                  <Astronaut color={c} size={i === 2 ? 67 : 54} hat={i === 2} />
                  <span>{["You", "Rohan", "Arjun", "Dev", "+2"][i]}</span>
                  <i className={(i === 0 ? done : i < 3) ? "ready" : ""} />
                </div>
              ))}
            </div>
            <div className="crew-ready">
              <span>
                <strong>{done ? "4" : "3"} of 6</strong> checked in today
              </span>
              <span>{done ? "67" : "50"}%</span>
            </div>
            <div className="progress-track">
              <i style={{ width: done ? "67%" : "50%" }} />
            </div>
            <a className="button secondary full" href="#crew/boys">
              Enter the lobby <ArrowUpRight size={16} />
            </a>
          </section>
          <section className="feed-card">
            <SectionTitle
              title="Around the crew"
              href="#crew/boys"
              action="Open"
            />
            <div className="feed-entry">
              <span className="avatar lilac">
                <Astronaut color="lilac" size={31} />
              </span>
              <div>
                <p>
                  <strong>Rohan</strong> checked in
                </p>
                <span>“Gym done. Still in 💪”</span>
                <small>12 minutes ago</small>
              </div>
              <span className="feed-check">
                <Check size={12} />
              </span>
            </div>
            <div className="feed-entry">
              <span className="avatar peach">
                <Astronaut color="peach" size={31} />
              </span>
              <div>
                <p>
                  <strong>Arjun</strong> hit 14 days
                </p>
                <span>Two weeks. Absolute scenes.</span>
                <small>48 minutes ago</small>
              </div>
              <span>✦</span>
            </div>
            {done && (
              <div className="feed-entry">
                <span className="avatar mint">
                  <Astronaut size={31} />
                </span>
                <div>
                  <p>
                    <strong>You</strong> checked in
                  </p>
                  <span>{state.entries[0]?.note || "Still in."}</span>
                  <small>Saved on this device</small>
                </div>
              </div>
            )}
          </section>
          <section className="quote-card">
            <span className="pixel-star">✳</span>
            <p>
              For the boys.
              <br />
              <strong>For yourself.</strong>
            </p>
            <span>It’s easier when you’re not doing it alone.</span>
          </section>
        </aside>
      </div>
    </>
  );
}
export function Crews({ state, open }: PageProps) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR PEOPLE, YOUR PACE"
        title="Better with the boys."
        description="Private lobbies. Shared promises. Good company."
        action={
          <button className="button primary" onClick={() => open("crew")}>
            <Plus size={17} /> Create a crew
          </button>
        }
      />
      <div className="crew-grid">
        {state.crews.map((c, i) => (
          <a
            href={`#crew/${c.id}`}
            className={`crew-tile ${c.color}`}
            key={c.id}
          >
            <div className="tile-top">
              <span className="pill glass">
                <LockKeyhole size={13} /> Private crew
              </span>
              <ArrowUpRight size={19} />
            </div>
            <div className="tile-astronauts">
              <Astronaut color={c.color} size={100} hat />
              <Astronaut color={i ? "mint" : "lilac"} size={76} />
              <Astronaut color="blue" size={64} />
            </div>
            <h2 className="display">{c.name}</h2>
            <p>{c.description}</p>
            <div className="tile-bottom">
              <span>
                <Users size={15} /> {c.members}{" "}
                {c.members === 1 ? "member" : "members"}
              </span>
              <span>
                Enter lobby <ArrowRight size={16} />
              </span>
            </div>
          </a>
        ))}
        <button className="join-tile" onClick={() => open("join")}>
          <span className="dashed-circle">
            <Link size={25} />
          </span>
          <h2>Got an invite?</h2>
          <p>
            Your crew saved you a spot.
            <br />
            Join with an invite code.
          </p>
          <span className="text-link">
            Join a crew <ArrowRight size={17} />
          </span>
        </button>
      </div>
      <div className="info-strip">
        <ShieldCheck size={20} />
        <div>
          <strong>Your circle stays your circle.</strong>
          <p>Invite-only crews. No public feed. No random spectators.</p>
        </div>
      </div>
    </>
  );
}
export function CrewDetail({
  state,
  open,
  notify,
  id,
}: PageProps & { id: string }) {
  const crew = state.crews.find((c) => c.id === id);
  if (!crew) return <NotFound />;
  const demo = ["boys", "early"].includes(id);
  return (
    <>
      <a href="#crews" className="back-link">
        <ArrowLeft size={16} /> All crews
      </a>
      <PageHeading
        eyebrow="PRIVATE LOBBY"
        title={crew.name}
        description={crew.description}
        action={
          <button
            className="button primary"
            onClick={() => open(`invite:${crew.id}`)}
          >
            <Plus size={17} /> Invite the boys
          </button>
        }
      />
      <div className="lobby-layout">
        <section className={`lobby-stage ${crew.color}`}>
          <div className="section-title">
            <span className="pill glass">
              <span className="status-dot" /> LOBBY OPEN
            </span>
            <span className="small-label">{crew.members} CREW MEMBERS</span>
          </div>
          <div className="lobby-people">
            {(demo
              ? ["You", "Rohan", "Arjun", "Dev", "Kabir", "Ishaan"].slice(
                  0,
                  crew.members,
                )
              : ["You"]
            ).map((name, i) => (
              <div key={name}>
                <Astronaut
                  color={
                    ["mint", "lilac", "peach", "blue", "yellow", "rose"][i]
                  }
                  size={90}
                  hat={i === 0}
                />
                <strong>{name}</strong>
                <span className={cn("pill", i < 3 ? "glass" : "neutral")}>
                  {i === 0
                    ? state.lastDay === dayKey()
                      ? "Ready ✓"
                      : "Your task awaits"
                    : i < 3
                      ? "Ready ✓"
                      : "On their way"}
                </span>
              </div>
            ))}
          </div>
          <div className="lobby-note">
            <Users size={17} />{" "}
            {demo
              ? "Sample crew · everyone has their own pace"
              : "Your lobby is ready. Invite someone to start together."}
          </div>
        </section>
        <section className="panel">
          <h2>Today’s mission</h2>
          <p className="muted">
            Keep your promise, then let your crew know you’re still in.
          </p>
          <div className="task-preview">
            <CheckCheck size={27} />
            <div>
              <strong>Daily check-in</strong>
              <span>Photo or a quick note</span>
            </div>
          </div>
          <button
            className="button primary full"
            onClick={() => open("checkin")}
          >
            Complete your task <ArrowRight size={17} />
          </button>
          <p className="fineprint">
            This is a local UI preview. Demo members aren’t live users.
          </p>
        </section>
      </div>
      <SectionTitle title="Crew challenges" />
      <div className="challenge-grid">
        {state.challenges
          .filter((c) => c.crewId === id)
          .map((c) => (
            <ChallengeCard key={c.id} c={c} />
          ))}
        <button
          className="new-challenge"
          onClick={() => open(`challenge:${crew.id}`)}
        >
          <Plus size={24} />
          <strong>Start something together</strong>
          <span>Anyone in the crew can add a challenge.</span>
        </button>
      </div>
      <section className="crew-code">
        <div>
          <span className="eyebrow">DEMO INVITE CODE</span>
          <strong>{crew.code}</strong>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            navigator.clipboard
              .writeText(crew.code)
              .then(() =>
                notify("Invite code copied. Demo codes work on this device."),
              )
              .catch(() => notify(`Invite code: ${crew.code}`));
          }}
        >
          <Copy size={16} /> Copy code
        </button>
      </section>
    </>
  );
}
function ChallengeCard({ c }: { c: Challenge }) {
  return (
    <a href={`#challenge/${c.id}`} className="challenge-card">
      <div
        className={cn(
          "challenge-art",
          c.kind === "Digital reset"
            ? "peach"
            : c.days === 7
              ? "lilac"
              : "mint",
        )}
      >
        <span className="pill glass">{c.kind}</span>
        {c.days === 7 ? (
          <Sun size={72} strokeWidth={1} />
        ) : c.kind === "Digital reset" ? (
          <Orbit size={72} strokeWidth={1} />
        ) : (
          <Flag size={72} strokeWidth={1} />
        )}
        <span className="challenge-length display">
          {c.days}
          <small>DAYS</small>
        </span>
      </div>
      <div className="challenge-card-body">
        <h2>{c.title}</h2>
        <p>{c.description}</p>
        <div className="tile-bottom">
          <span>
            <Users size={14} /> {c.members} in the crew
          </span>
          <span>
            {c.joined ? "Joined ✓" : "Take a look"} <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </a>
  );
}
export function Challenges({ state, open }: PageProps) {
  const [filter, setFilter] = useState("all");
  const list = state.challenges.filter((c) => filter === "all" || c.joined);
  return (
    <>
      <PageHeading
        eyebrow="LITTLE CHALLENGES. REAL FOLLOW-THROUGH."
        title="Pick your next mission."
        description="Make a promise that matters to you. Bring your people."
        action={
          <button className="button primary" onClick={() => open("challenge")}>
            <Plus size={17} /> New challenge
          </button>
        }
      />
      <div className="filter-row">
        <div className="segmented compact">
          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            All missions <span>{state.challenges.length}</span>
          </button>
          <button
            className={filter === "joined" ? "selected" : ""}
            onClick={() => setFilter("joined")}
          >
            My missions{" "}
            <span>{state.challenges.filter((c) => c.joined).length}</span>
          </button>
        </div>
        <span className="muted small">Made by the crew, for the crew.</span>
      </div>
      <div className="challenge-grid">
        {list.map((c) => (
          <ChallengeCard key={c.id} c={c} />
        ))}
      </div>
      {!list.length && (
        <div className="empty-state">
          <Flag size={40} />
          <h2>Your next chapter starts here.</h2>
          <button className="button primary" onClick={() => setFilter("all")}>
            Explore missions
          </button>
        </div>
      )}
      <div className="info-strip">
        <Sparkles size={22} />
        <div>
          <strong>One daily check-in, all your commitments.</strong>
          <p>
            Your personal streak rewards showing up. Challenges are shared
            goals, not separate point farms.
          </p>
        </div>
      </div>
    </>
  );
}
export function ChallengeDetail({
  state,
  update,
  open,
  notify,
  id,
}: PageProps & { id: string }) {
  const c = state.challenges.find((x) => x.id === id);
  if (!c) return <NotFound />;
  return (
    <>
      <a className="back-link" href="#challenges">
        <ArrowLeft size={16} /> All missions
      </a>
      <div className="challenge-detail">
        <div className="challenge-detail-copy">
          <span className="pill mint">
            <Flag size={14} /> {c.kind} · {c.days} days
          </span>
          <h1 className="display">{c.title}</h1>
          <p className="lead">{c.description}</p>
          <div className="people-inline">
            <AvatarStack />
            <span>
              {c.members} {c.members === 1 ? "person" : "people"} making the
              same promise.
            </span>
          </div>
          <div className="rules-list">
            <h2>The mission is simple.</h2>
            {[
              "Choose this commitment for yourself.",
              "Show up daily with a photo or a short note.",
              "Check in honestly. Your crew’s here to support you.",
              "Miss a day? Start again. Your past effort still counts.",
            ].map((text, i) => (
              <div key={text}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
          {c.joined ? (
            <button className="button primary" onClick={() => open("checkin")}>
              You’re in. Check in today <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="button primary"
              onClick={() => {
                update({
                  challenges: state.challenges.map((x) =>
                    x.id === id
                      ? { ...x, joined: true, members: x.members + 1 }
                      : x,
                  ),
                });
                notify("You’re on the crew. Your mission starts today.");
              }}
            >
              Join the mission <ArrowRight size={18} />
            </button>
          )}
        </div>
        <div className="mission-poster">
          <span className="eyebrow">ONE PROMISE / ONE DAY AT A TIME</span>
          <Astronaut size={220} hat />
          <h2 className="display">
            YOU’RE
            <br />
            NOT SOLO.
          </h2>
          <div className="poster-bottom">
            <span>{c.days} DAYS</span>
            <span>YOUR CREW’S GOT YOU ↗</span>
          </div>
        </div>
      </div>
    </>
  );
}
export function Rankings({ state }: PageProps) {
  const [best, setBest] = useState(false);
  const [crewId, setCrewId] = useState("boys");
  const crew = state.crews.find((c) => c.id === crewId);
  const demo = ["boys", "early"].includes(crewId);
  const list = [
    {
      name: state.name,
      color: "mint",
      days: best ? state.best : currentStreak(state),
      you: true,
    },
    ...(demo
      ? [
          { name: "Arjun", color: "peach", days: best ? 28 : 14, you: false },
          { name: "Rohan", color: "lilac", days: best ? 21 : 9, you: false },
          { name: "Dev", color: "blue", days: best ? 12 : 5, you: false },
          { name: "Kabir", color: "yellow", days: best ? 10 : 3, you: false },
          { name: "Ishaan", color: "rose", days: best ? 7 : 2, you: false },
        ].slice(0, (crew?.members || 6) - 1)
      : []),
  ].sort((a, b) => b.days - a.days);
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE FRIENDLY COMPETITION"
        title="Big up the boys."
        description="Celebrate consistency. Everyone’s running their own race."
      />
      <div className="filter-row">
        <div className="segmented compact">
          <button
            className={!best ? "selected" : ""}
            onClick={() => setBest(false)}
          >
            Current streak
          </button>
          <button
            className={best ? "selected" : ""}
            onClick={() => setBest(true)}
          >
            Personal best
          </button>
        </div>
        <label className="inline-select">
          <Users size={16} />
          <select
            aria-label="Leaderboard crew"
            value={crewId}
            onChange={(e) => setCrewId(e.target.value)}
          >
            {state.crews.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="podium">
        {list.slice(0, 3).map((p, i) => (
          <div key={p.name} className={`podium-person place-${i}`}>
            <span className="rank-orbit">
              {i === 0 ? <Trophy size={18} /> : i + 1}
            </span>
            <Astronaut
              color={p.color}
              size={i === 0 ? 112 : 88}
              hat={i === 0}
            />
            <h2>{p.you ? "You" : p.name}</h2>
            <span>
              <strong>{p.days}</strong> days
            </span>
            <div className="podium-plinth">
              {i === 0
                ? "THE LONG GAME"
                : i === 1
                  ? "KEEPING IT REAL"
                  : "SHOWING UP"}
            </div>
          </div>
        ))}
      </div>
      <div className="leaderboard">
        <div className="leaderboard-header">
          <span>RANK</span>
          <span>CREW MEMBER</span>
          <span>{best ? "BEST STREAK" : "CURRENT STREAK"}</span>
        </div>
        {list.map((p, i) => (
          <div
            className={cn("leaderboard-row", p.you && "is-you")}
            key={p.name}
          >
            <span className="rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="leaderboard-name">
              <span className={`avatar ${p.color}`}>
                <Astronaut color={p.color} size={31} />
              </span>
              <strong>{p.name}</strong>
              {p.you && <span className="pill neutral">YOU</span>}
            </span>
            <span className="rank-days">
              <Flame size={16} />
              <strong>{p.days}</strong> days
            </span>
          </div>
        ))}
      </div>
      <p className="fineprint centered">
        {demo ? "Sample standings for this UI preview. " : ""}Ranks are based on
        self-reported check-ins, not verified abstinence.
      </p>
    </>
  );
}
export function Profile({ state, update, open, notify }: PageProps) {
  const [name, setName] = useState(state.name);
  function save(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      update({ name: name.trim() });
      notify("Nickname updated.");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR SPACE"
        title="A little better, daily."
        description="Your progress belongs to you. Own it."
      />
      <div className="profile-grid">
        <section className="profile-card">
          <div className="profile-avatar">
            <Astronaut size={110} hat />
          </div>
          <h2 className="display">{state.name}</h2>
          <span className="pill mint">CREW MEMBER / LOCAL DEMO</span>
          <div className="profile-stats">
            <div>
              <strong>{currentStreak(state)}</strong>
              <span>Current streak</span>
            </div>
            <div>
              <strong>{state.best}</strong>
              <span>Personal best</span>
            </div>
          </div>
          <div className="badge-row">
            <span>
              <Flame size={23} />
              First spark
            </span>
            <span>
              <Flag size={23} />
              Crew player
            </span>
            <span className={state.best < 14 ? "locked-badge" : ""}>
              <Trophy size={23} />
              Two-week club
            </span>
          </div>
        </section>
        <section className="panel settings-panel">
          <h2>Make yourself at home.</h2>
          <form onSubmit={save}>
            <label className="field">
              Your nickname
              <input
                name="nickname"
                autoComplete="nickname"
                required
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button className="button secondary" type="submit">
              Save nickname <Check size={16} />
            </button>
          </form>
          <div className="setting-row">
            <div>
              <strong>A little nudge</strong>
              <p>Reminder preference · notifications aren’t connected yet.</p>
            </div>
            <button
              role="switch"
              aria-checked={state.reminder}
              aria-label="Daily reminder preference"
              className={cn("switch", state.reminder && "on")}
              onClick={() => update({ reminder: !state.reminder })}
            >
              <span />
            </button>
          </div>
          <div className="setting-row">
            <div>
              <strong>A home on your home screen</strong>
              <p>Keep the crew one tap away.</p>
            </div>
            <button
              className="icon-button"
              aria-label="How to install the app"
              onClick={() => open("install")}
            >
              <Download size={20} />
            </button>
          </div>
          <div className="setting-row">
            <div>
              <strong>Start a fresh streak</strong>
              <p>Your best streak stays. No shame in a new start.</p>
            </div>
            <button className="text-link" onClick={() => open("restart")}>
              Restart <ArrowUpRight size={16} />
            </button>
          </div>
          <a className="text-link" href="#welcome">
            Preview the welcome screen <ArrowUpRight size={16} />
          </a>
        </section>
      </div>
    </>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="display">{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function NotFound() {
  return (
    <div className="empty-state">
      <Compass size={40} />
      <h1 className="display">A little off course.</h1>
      <p>This crew or mission doesn’t exist on this device.</p>
      <a className="button primary" href="#today">
        Back to your day
      </a>
    </div>
  );
}

function OrderedMain({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  const sections = Children.toArray(children);
  const order =
    theme === "night" ? [2, 1, 0] : theme === "club" ? [1, 0, 2] : [0, 1, 2];
  return <div className="main-column">{order.map((i) => sections[i])}</div>;
}

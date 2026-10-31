import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCheck,
  Camera,
  Flag,
  Users,
  Sparkles,
  LayoutGrid,
  Orbit,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Astronaut, Vault, cn, AvatarStack } from "./components/Primitives";
import { themes, type Theme } from "./data";
import { PageHeading, type PageProps } from "./pages";
export default function DesignLab({ state, update, go }: PageProps) {
  const [selected, setSelected] = useState<Theme>(state.theme);
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState("");
  const theme = themes[selected];
  const details = {
    day: [
      {
        title: "Your crew is your corner.",
        body: "Join the boys with a code, or build a little crew of your own.",
        action: "Create my crew",
        secondary: "I have an invite",
      },
      {
        title: "Make a small promise.",
        body: "Pick a challenge together. Keep the commitment yours.",
        action: "Start the 7-day reset",
        secondary: "Create a challenge",
      },
      {
        title: "One task. Every day.",
        body: "An everyday photo or a quick note. That’s your “still in.”",
        action: "I’m still in",
        secondary: "Write a note instead",
      },
      {
        title: "Look at us go.",
        body: "A whole crew showing up. Tomorrow, we do it again.",
        action: "Enter Day Shift",
        secondary: "Try another journey",
      },
    ],
    night: [
      {
        title: "Choose your mission.",
        body: "A 7-day reset or the full November run. You call it, captain.",
        action: "Accept the 30-day mission",
        secondary: "Start with 7 days",
      },
      {
        title: "Your lobby is ready.",
        body: "Choose a crew color and invite your people aboard.",
        action: "Invite my crew",
        secondary: "Join an existing lobby",
      },
      {
        title: "Your daily task awaits.",
        body: "Keep your promise. Complete one honest check-in.",
        action: "Complete daily task",
        secondary: "Try a text check-in",
      },
      {
        title: "Round complete.",
        body: "No impostors to find. Just good people keeping their word.",
        action: "Enter Night Shift",
        secondary: "Try another journey",
      },
    ],
    club: [
      {
        title: "Try a little check-in.",
        body: "No big setup. Just a small note: what’s one good thing today?",
        action: "“Went for a walk. Still in.”",
        secondary: "Try the photo ritual",
      },
      {
        title: "What do the boys call you?",
        body: "A nickname and a color. Make yourself at home.",
        action: "That’s me. Let’s go.",
        secondary: "Keep it anonymous",
      },
      {
        title: "Good habits like company.",
        body: "Send the boys a lobby code. Your circle, your rules.",
        action: "Make my invite",
        secondary: "I’ll explore first",
      },
      {
        title: "Same time tomorrow?",
        body: "That’s the whole thing. A small daily ritual, together.",
        action: "Enter Lobby Club",
        secondary: "Try another journey",
      },
    ],
  };
  const screen = details[selected][step];
  return (
    <>
      <PageHeading
        eyebrow="DESIGN LAB / THREE WAYS TO LOCK IN"
        title="Same crew. Different energy."
        description="Try the look. Walk the journey. Pick what feels like the boys."
      />
      <div className="design-options">
        {(Object.keys(themes) as Theme[]).map((t) => (
          <button
            key={t}
            className={cn("design-option", t, selected === t && "active")}
            onClick={() => {
              setSelected(t);
              setStep(0);
              setChoice("");
            }}
          >
            <div className="design-thumbnail">
              <div className="mini-rail">
                <i />
                <i />
                <i />
              </div>
              <div className="mini-content">
                <span className="mini-header">
                  {themes[t].name.toUpperCase()}
                </span>
                <div className="mini-hero">
                  <span className="display">
                    06<small>DAYS IN</small>
                  </span>
                  <Astronaut
                    color={
                      t === "night" ? "lilac" : t === "club" ? "peach" : "mint"
                    }
                    size={68}
                  />
                </div>
                <div className="mini-cards">
                  <div />
                  <div />
                </div>
                <div className="mini-button">I’M STILL IN →</div>
              </div>
              <span className="theme-check">
                {selected === t ? <Check size={14} /> : themes[t].icon}
              </span>
            </div>
            <div className="design-option-copy">
              <h2>
                {themes[t].name}
                <span>0{Object.keys(themes).indexOf(t) + 1}</span>
              </h2>
              <p>{themes[t].description}</p>
              <span className="text-link">
                {t === "day"
                  ? "Crew-first journey"
                  : t === "night"
                    ? "Mission-first journey"
                    : "Ritual-first journey"}{" "}
                <ArrowUpRightMini />
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="journey-heading">
        <div>
          <span className="eyebrow">CLICK THROUGH THE EXPERIENCE</span>
          <h2 className="display">The {theme.name} journey.</h2>
        </div>
        <button
          className="button primary"
          onClick={() => {
            update({ theme: selected });
            go("today");
          }}
        >
          Try this full UI <ArrowRight size={17} />
        </button>
      </div>
      <div className={cn("journey-preview", selected)}>
        <aside className="journey-steps">
          <span className="eyebrow">FROM HELLO TO HABIT</span>
          {theme.flow.map((s, i) => (
            <button
              key={s}
              className={cn(
                "journey-step",
                step === i && "active",
                step > i && "past",
              )}
              onClick={() => {
                setStep(i);
                setChoice("");
              }}
            >
              <span>{step > i ? <Check size={16} /> : `0${i + 1}`}</span>
              <div>
                <strong>{s}</strong>
                <small>
                  {
                    [
                      "A low-pressure start",
                      "Your choice, your commitment",
                      "The everyday ritual",
                      "A reason to come back",
                    ][i]
                  }
                </small>
              </div>
            </button>
          ))}
          <div className="journey-note">
            <ShieldCheck size={19} />
            <p>
              Reviewed for clear next steps, privacy, and a kind restart after a
              missed day.
            </p>
          </div>
        </aside>
        <section className="journey-screen">
          <div className="journey-screen-top">
            <span className="display">LOCKED IN.</span>
            <span>{step + 1} / 4</span>
          </div>
          <div className="journey-scene">
            {step === 0 && selected === "night" ? (
              <div className="journey-missions">
                <span>
                  <Flag size={24} />
                  <strong>7</strong>
                  <small>DAY RESET</small>
                </span>
                <span className="picked">
                  <Orbit size={24} />
                  <strong>30</strong>
                  <small>DAY MISSION</small>
                </span>
              </div>
            ) : step === 2 || (step === 0 && selected === "club") ? (
              <div className="journey-checkin">
                <Camera size={35} />
                <span>A moment from your day</span>
                <div>
                  <CheckCheck size={18} /> Still in. Still showing up.
                </div>
              </div>
            ) : step === 3 ? (
              <Vault days={7} />
            ) : (
              <div className="journey-crew">
                <Astronaut color="lilac" size={86} />
                <Astronaut
                  color={selected === "club" ? "peach" : "mint"}
                  size={118}
                  hat
                />
                <Astronaut color="blue" size={86} />
              </div>
            )}
          </div>
          <span className="pill glass">
            {selected === "night"
              ? "CREW STATUS / "
              : selected === "club"
                ? "THE LITTLE RITUAL / "
                : "YOUR NEXT STEP / "}
            0{step + 1}
          </span>
          <h3 className="display">{screen.title}</h3>
          <p>{screen.body}</p>
          {choice && (
            <div className="journey-choice" role="status">
              <Check size={14} />
              {choice}
            </div>
          )}
          <button
            className="button primary full"
            onClick={() => {
              if (step < 3) {
                setChoice("");
                setStep(step + 1);
              } else {
                update({ theme: selected });
                go("welcome");
              }
            }}
          >
            {screen.action}
            <ArrowRight size={16} />
          </button>
          <button
            className="journey-secondary"
            onClick={() => {
              if (step === 3) {
                setStep(0);
                setSelected(
                  selected === "day"
                    ? "night"
                    : selected === "night"
                      ? "club"
                      : "day",
                );
                setChoice("");
              } else {
                setChoice(
                  screen.secondary.includes("invite")
                    ? "Invite path selected — your crew context stays with you."
                    : "Alternative selected — the next step stays simple.",
                );
                setStep(step + 1);
              }
            }}
          >
            {screen.secondary}
          </button>
          <div className="journey-controls">
            <button
              className="icon-button"
              aria-label="Previous journey step"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  aria-label={`Go to journey step ${i + 1}`}
                  aria-current={i === step ? "step" : undefined}
                  className={i === step ? "active" : ""}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>
            <button
              className="icon-button"
              aria-label="Next journey step"
              disabled={step === 3}
              onClick={() => setStep(step + 1)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
      <div className="journey-review">
        <div>
          <span className="pill mint">
            <Check size={14} /> JOURNEY REVIEWED
          </span>
          <h3>Game energy. Real-life kindness.</h3>
        </div>
        <p>
          Inspired by the lobby, crew colors, shared tasks, and round results.
          No voting people out, no public shaming, no pretending a photo proves
          abstinence.
        </p>
      </div>
    </>
  );
}
function ArrowUpRightMini() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
export function Welcome({ state, update, go, notify }: PageProps) {
  const [name, setName] = useState(state.onboarded ? state.name : "");
  const [previewDay, setPreviewDay] = useState(4);
  return (
    <div className="welcome">
      <section className="welcome-art">
        <div className="eyebrow">A SMALL PROMISE. A SOLID CREW.</div>
        <h1 className="display">
          Stay in.
          <br />
          Together.
        </h1>
        <p>
          For the boys.
          <br />
          And the person you’re becoming.
        </p>
        <div className="welcome-figure">
          <Vault days={previewDay} />
          <div className="figure-caption">
            <span>FIG 01 / THE STREAK VAULT</span>
            <span>{previewDay} OF 7 DAYS</span>
          </div>
          <label className="vault-range">
            Build your week
            <input
              aria-label="Preview streak vault days"
              type="range"
              min="0"
              max="7"
              value={previewDay}
              onChange={(e) => setPreviewDay(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="welcome-crew">
          <AvatarStack />
          <span>
            Good company.
            <br />
            <strong>Better follow-through.</strong>
          </span>
        </div>
      </section>
      <section className="welcome-form">
        <a href="#lab" className="back-link">
          <ArrowLeft size={16} /> Back to Design Lab
        </a>
        <span className="pill neutral">
          {themes[state.theme].name.toUpperCase()} / LOCAL PREVIEW
        </span>
        <h2 className="display">
          Your crew’s
          <br />
          waiting.
        </h2>
        <p>A nickname. A promise. A little momentum.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            update({ name: name.trim(), onboarded: true });
            go(
              state.theme === "night"
                ? "challenges"
                : state.theme === "club"
                  ? "today"
                  : "crews",
            );
            notify("Welcome aboard. You’re exploring a local demo.");
          }}
        >
          <label className="field">
            What do the boys call you?
            <input
              required
              name="nickname"
              autoComplete="nickname"
              placeholder="Your nickname…"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button type="submit" className="button primary full">
            Let’s lock in <ArrowRight size={18} />
          </button>
        </form>
        <div className="welcome-divider">
          <span />
          or take a look around
          <span />
        </div>
        <button className="button secondary full" onClick={() => go("today")}>
          Explore the demo <ArrowUpRightMini />
        </button>
        <p className="fineprint">
          <LockIcon /> This is the login design preview. No account is created;
          your nickname and demo progress stay in this browser.
        </p>
        <div className="welcome-bottom">
          <span>YOUR PACE. YOUR PEOPLE.</span>
          <span>✳</span>
        </div>
      </section>
    </div>
  );
}
function LockIcon() {
  return <ShieldCheck size={14} />;
}

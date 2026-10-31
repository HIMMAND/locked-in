import { dayKey, previousDay } from "./streak.mjs";
export type Theme = "day" | "night" | "club";
export type Crew = {
  id: string;
  name: string;
  code: string;
  members: number;
  color: string;
  description: string;
};
export type Challenge = {
  id: string;
  title: string;
  description: string;
  days: number;
  members: number;
  joined: boolean;
  kind: string;
  crewId: string;
};
export type Entry = {
  id: string;
  day: string;
  note: string;
  hasPhoto: boolean;
};
export type State = {
  name: string;
  streak: number;
  best: number;
  lastDay: string;
  crews: Crew[];
  challenges: Challenge[];
  entries: Entry[];
  reminder: boolean;
  theme: Theme;
  onboarded: boolean;
};
export const initial: State = {
  name: "Himanshu",
  streak: 6,
  best: 14,
  lastDay: previousDay(),
  reminder: false,
  theme: "day",
  onboarded: false,
  crews: [
    {
      id: "boys",
      name: "The boys",
      code: "BOYS24",
      members: 6,
      color: "mint",
      description: "Same crew. Better habits. One day at a time.",
    },
    {
      id: "early",
      name: "Early birds",
      code: "EARLY7",
      members: 4,
      color: "peach",
      description: "Less scrolling, more sunrises.",
    },
  ],
  challenges: [
    {
      id: "november",
      title: "No Nut November",
      description: "30 days. One promise. Show up for yourself and the boys.",
      days: 30,
      members: 6,
      joined: true,
      kind: "Abstinence",
      crewId: "boys",
    },
    {
      id: "week",
      title: "The 7-day reset",
      description: "Start small. A fresh week of keeping your word.",
      days: 7,
      members: 4,
      joined: false,
      kind: "Abstinence",
      crewId: "boys",
    },
    {
      id: "offline",
      title: "Offline after 10",
      description: "Put your phone down. Give tomorrow a head start.",
      days: 14,
      members: 4,
      joined: false,
      kind: "Digital reset",
      crewId: "early",
    },
  ],
  entries: [],
};
export const themes = {
  day: {
    name: "Day Shift",
    label: "A little lighter.",
    description: "Soft daylight, mint gradients, and your crew up front.",
    flow: [
      "Meet your crew",
      "Make a promise",
      "Check in together",
      "Celebrate the round",
    ],
    icon: "☀",
  },
  night: {
    name: "Night Shift",
    label: "All aboard.",
    description: "A quiet orbital lounge. One mission. Everyone on board.",
    flow: [
      "Choose your mission",
      "Enter the lobby",
      "Complete your daily task",
      "See the round results",
    ],
    icon: "☾",
  },
  club: {
    name: "Lobby Club",
    label: "Good company.",
    description: "Peach skies, playful badges, and a tiny daily ritual.",
    flow: [
      "Try a check-in",
      "Choose your nickname",
      "Invite your people",
      "Make it a daily thing",
    ],
    icon: "✳",
  },
};
export function readState(): State {
  try {
    const s = JSON.parse(localStorage.getItem("locked-in-v1") || "null");
    if (
      s &&
      Array.isArray(s.crews) &&
      Array.isArray(s.challenges) &&
      Array.isArray(s.entries)
    )
      return { ...initial, ...s };
  } catch {}
  return structuredClone(initial);
}
export { dayKey };

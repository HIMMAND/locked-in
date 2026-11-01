export type User = { id: string; name: string; email: string };
export type Crew = {
  id: string;
  name: string;
  ownerId: string;
  timezone: string;
  members: number;
  inviteCode?: string;
  inviteCreatedAt?: number;
};
export type Challenge = {
  id: string;
  crewId: string;
  name: string;
  description: string;
  days: number;
  startDay: string;
  endDay: string;
  joined: boolean;
  participants: number;
};
export type Rank = {
  id: string;
  name: string;
  current: number;
  best: number;
  total: number;
  checkedIn: boolean;
};
export type Entry = {
  id: string;
  userId: string;
  name: string;
  day: string;
  note: string;
  hasPhoto: boolean;
  createdAt: number;
};
export type CrewView = {
  crew: Crew;
  challenges: Challenge[];
  members: { id: string; name: string }[];
  today: string;
};
export type ChallengeView = {
  challenge: Challenge;
  today: string;
  rankings: Rank[];
  feed: Entry[];
  myDays: string[];
};

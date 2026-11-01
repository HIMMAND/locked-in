export function dayInZone(timezone, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function addDays(day, count) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
export function streakStats(days, today) {
  const sorted = [...new Set(days)].sort();
  const set = new Set(sorted);
  let best = 0,
    run = 0,
    last = "";
  for (const day of sorted) {
    run = last && addDays(last, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    last = day;
  }
  let cursor = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, best, total: sorted.length, checkedIn: set.has(today) };
}

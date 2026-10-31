export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function previousDay(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}
export function currentStreak(state, date = new Date()) {
  return state.lastDay === dayKey(date) || state.lastDay === previousDay(date)
    ? state.streak
    : 0;
}
export function recordCheckin(state, date = new Date()) {
  const today = dayKey(date);
  if (state.lastDay === today) return state;
  const streak = currentStreak(state, date) + 1;
  return {
    ...state,
    lastDay: today,
    streak,
    best: Math.max(state.best, streak),
  };
}

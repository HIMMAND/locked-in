import test from "node:test";
import assert from "node:assert/strict";
import {
  dayKey,
  previousDay,
  currentStreak,
  recordCheckin,
} from "../src/streak.mjs";
const today = new Date(2026, 10, 1, 12);
test("daily keys use the user’s local calendar and cross month boundaries", () => {
  assert.equal(dayKey(today), "2026-11-01");
  assert.equal(previousDay(today), "2026-10-31");
  assert.equal(previousDay(new Date(2027, 0, 1, 0, 1)), "2026-12-31");
});
test("consecutive check-in increments exactly once", () => {
  const state = { lastDay: "2026-10-31", streak: 6, best: 14 };
  const next = recordCheckin(state, today);
  assert.equal(next.streak, 7);
  assert.equal(next.best, 14);
  assert.equal(recordCheckin(next, today), next);
});
test("a missed day starts a fresh streak while preserving the best", () => {
  const state = { lastDay: "2026-10-29", streak: 6, best: 14 };
  assert.equal(currentStreak(state, today), 0);
  assert.deepEqual(recordCheckin(state, today), {
    lastDay: "2026-11-01",
    streak: 1,
    best: 14,
  });
});
test("new users start at one, and new records update the best", () => {
  assert.equal(
    recordCheckin({ lastDay: "", streak: 0, best: 0 }, today).streak,
    1,
  );
  assert.equal(
    recordCheckin({ lastDay: "2026-10-31", streak: 14, best: 14 }, today).best,
    15,
  );
});

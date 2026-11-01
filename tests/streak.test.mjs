import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, dayInZone, streakStats } from "../src/lib/streak.mjs";

test("crew timezone decides the day across midnight and DST", () => {
  const instant = new Date("2026-11-01T02:30:00Z");
  assert.equal(dayInZone("Asia/Dubai", instant), "2026-11-01");
  assert.equal(dayInZone("America/New_York", instant), "2026-10-31");
  assert.equal(addDays("2026-11-01", -1), "2026-10-31");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});
test("empty accounts start at zero with no sample history", () => {
  assert.deepEqual(streakStats([], "2026-11-01"), {
    current: 0,
    best: 0,
    total: 0,
    checkedIn: false,
  });
});
test("yesterday carries a streak until today ends; duplicates do not count", () => {
  assert.deepEqual(
    streakStats(["2026-10-30", "2026-10-31", "2026-10-31"], "2026-11-01"),
    { current: 2, best: 2, total: 2, checkedIn: false },
  );
});
test("a missed day resets current streak while retaining personal best", () => {
  assert.deepEqual(
    streakStats(["2026-10-28", "2026-10-29", "2026-11-01"], "2026-11-01"),
    { current: 1, best: 2, total: 3, checkedIn: true },
  );
  assert.equal(
    streakStats(["2026-10-28", "2026-10-29"], "2026-11-01").current,
    0,
  );
});

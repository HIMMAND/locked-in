import { execFileSync } from "node:child_process";

// Test fixtures live only in the local D1 emulator; never touch deployed data.
export default function cleanLocal() {
  const host = new URL(process.env.TEST_BASE_URL || "http://localhost:5173")
    .hostname;
  if (!["localhost", "127.0.0.1"].includes(host))
    throw new Error("Run these fixture tests against a local app only.");
  execFileSync(
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      "locked-in-db",
      "--local",
      "--command",
      "DELETE FROM crews WHERE ownerId IN (SELECT id FROM user WHERE email LIKE '%@example.test'); DELETE FROM challenges WHERE creatorId IN (SELECT id FROM user WHERE email LIKE '%@example.test'); DELETE FROM appRateLimits WHERE key IN (SELECT id FROM user WHERE email LIKE '%@example.test'); DELETE FROM user WHERE email LIKE '%@example.test'; DELETE FROM rateLimit;",
    ],
    { stdio: "pipe" },
  );
}

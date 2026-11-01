import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
if (!existsSync(".dev.vars"))
  writeFileSync(
    ".dev.vars",
    `NEXTJS_ENV=development\nBETTER_AUTH_SECRET=${randomBytes(48).toString("hex")}\nBETTER_AUTH_URL=http://localhost:5173\n`,
    { mode: 0o600 },
  );
execFileSync(
  "npx",
  ["wrangler", "d1", "migrations", "apply", "locked-in-db", "--local"],
  { stdio: "inherit" },
);
console.log("Local database and private auth secret ready. Run npm run dev.");

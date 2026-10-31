import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const findings = [];
for (const theme of ["Day Shift", "Night Shift", "Lobby Club"]) {
  await page.goto("http://localhost:5173/");
  await page.getByRole("button", { name: theme, exact: true }).click();
  await page.waitForTimeout(250);
  for (const route of ["today", "lab", "welcome", "crews", "rankings"]) {
    await page.goto("http://localhost:5173/#" + route);
    await page.waitForTimeout(200);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    findings.push({
      theme,
      route,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
          html: n.html,
        })),
      })),
    });
  }
}
writeFileSync(
  "artifacts/accessibility.json",
  JSON.stringify(findings, null, 2),
);
for (const f of findings)
  console.log(
    f.theme,
    f.route,
    f.violations.map((v) => `${v.id}: ${v.nodes.length}`).join(",") || "PASS",
  );
await browser.close();
if (findings.some((f) => f.violations.length)) process.exitCode = 1;

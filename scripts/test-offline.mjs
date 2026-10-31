import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto("http://localhost:4173/#lab");
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
await context.setOffline(true);
await page.reload();
await page
  .getByRole("heading", { name: "Same crew. Different energy." })
  .waitFor();
await page.goto("http://localhost:4173/#today");
await page
  .getByRole("heading", { name: "Small promises. Stronger together." })
  .waitFor();
console.log(
  "PASS: production app reloads and navigates offline after first visit.",
);
await browser.close();

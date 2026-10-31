import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1060 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:5173/");
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({ path: "artifacts/day-desktop.png", fullPage: true });
await page.goto("http://localhost:5173/#lab");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({ path: "artifacts/lab-desktop.png", fullPage: true });
await page
  .locator(".design-options")
  .screenshot({ path: "docs/previews/three-directions.png" });
await page.getByRole("button", { name: "Night Shift", exact: true }).click();
await page.goto("http://localhost:5173/#today");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({ path: "artifacts/night-desktop.png", fullPage: true });
await page.getByRole("button", { name: "Lobby Club", exact: true }).click();
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({ path: "artifacts/club-desktop.png", fullPage: true });
await page.goto("http://localhost:5173/#welcome");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({
  path: "artifacts/welcome-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:5173/#lab");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({ path: "artifacts/lab-mobile.png", fullPage: true });
await page.getByRole("button", { name: "Day Shift", exact: true }).click();
await page.goto("http://localhost:5173/#today");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(180);
await page.screenshot({ path: "artifacts/day-mobile.png", fullPage: true });
for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.goto("http://localhost:5173/icon.svg");
  await page.locator("svg").screenshot({ path: `public/icon-${size}.png` });
}
console.log(JSON.stringify({ errors }));
await browser.close();

import { test, expect } from "@playwright/test";
test("text check-in is honest, once daily, and survives reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await page.getByRole("button", { name: "Just a note", exact: true }).click();
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Write a quick note");
  await page
    .getByLabel("Your check-in", { exact: true })
    .fill("Went for a walk. Still in.");
  await page.getByLabel("I kept my promise today.").check();
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "7 days strong." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to the crew", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "View today’s check-in" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View today’s check-in" }).click();
  await expect(
    page.getByRole("heading", { name: "7 days strong." }),
  ).toBeVisible();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("locked-in-v1")!),
  );
  expect(data.entries).toHaveLength(1);
});
test("create crew and mission with persisted data and invitation", async ({
  page,
}) => {
  await page.goto("/#crews");
  await page
    .getByRole("button", { name: "Create a crew", exact: true })
    .last()
    .click();
  await page.getByLabel("Crew name", { exact: true }).fill("Weekend crew");
  await page.getByLabel("What’s the vibe?").fill("Small steps, together.");
  await page.getByRole("button", { name: "Create the lobby" }).click();
  await expect(
    page.getByRole("heading", { name: "Weekend crew", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start something together" }).click();
  await page.getByLabel("Challenge name").fill("Seven honest days");
  await page
    .getByLabel("The promise", { exact: true })
    .fill("Check in every day.");
  await page.getByRole("button", { name: "Start the mission" }).click();
  await expect(
    page.getByRole("heading", { name: "Seven honest days", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Seven honest days", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Weekend crew 1", exact: true }).click();
  await page.getByRole("button", { name: "Invite the boys" }).click();
  await expect(page.getByLabel("Or copy manually")).toHaveValue(/#invite\//);
});
test("invite errors recover and a known code opens the crew", async ({
  page,
}) => {
  await page.goto("/#crews");
  await page.getByRole("button", { name: "Got an invite?" }).click();
  await page.getByLabel("Invite code", { exact: true }).fill("NOTREAL");
  await page
    .getByRole("button", { name: "Enter the lobby", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Try BOYS24");
  await page.getByLabel("Invite code", { exact: true }).fill("boys24");
  await page
    .getByRole("button", { name: "Enter the lobby", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "The boys", exact: true }),
  ).toBeVisible();
});
test("photo check-in previews and removes a local image", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await page
    .getByLabel("Choose a check-in photo")
    .setInputFiles("public/icon-192.png");
  await expect(
    page.getByAltText("Your selected check-in preview"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.getByAltText("Your selected check-in preview")).toHaveCount(
    0,
  );
  await page
    .getByLabel("Choose a check-in photo")
    .setInputFiles("public/icon-192.png");
  await page.getByLabel("I kept my promise today.").check();
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "7 days strong." }),
  ).toBeVisible();
});
test("three variants have clickable four-step journeys", async ({ page }) => {
  await page.goto("/#lab");
  for (const theme of ["Day Shift", "Night Shift", "Lobby Club"]) {
    await page
      .locator(".design-option")
      .filter({ has: page.getByRole("heading", { name: theme, exact: false }) })
      .click();
    await expect(page.locator(".journey-screen-top")).toContainText("1 / 4");
    for (let i = 0; i < 3; i++)
      await page.locator(".journey-screen>.button").click();
    await expect(page.locator(".journey-screen-top")).toContainText("4 / 4");
    await page.getByRole("button", { name: "Try this full UI" }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      theme === "Day Shift"
        ? "day"
        : theme === "Night Shift"
          ? "night"
          : "club",
    );
    await page.goto("/#lab");
  }
});
test("welcome nickname changes route by chosen journey", async ({ page }) => {
  await page.goto("/#welcome");
  await page.getByRole("button", { name: "Night Shift" }).click();
  await page.getByLabel("What do the boys call you?").fill("Cosmo");
  await page.getByRole("button", { name: "Let’s lock in" }).click();
  await expect(page).toHaveURL(/#challenges$/);
  await page.goto("/#profile");
  await expect(
    page.getByRole("heading", { name: "Cosmo", exact: true }),
  ).toBeVisible();
});
test("restart is reversible before confirmation and retains personal best", async ({
  page,
}) => {
  await page.goto("/#profile");
  await page.getByRole("button", { name: "Restart", exact: false }).click();
  await page.getByRole("button", { name: "Keep my streak" }).click();
  await expect(page.locator(".profile-stats")).toContainText("6");
  await page.getByRole("button", { name: "Restart", exact: false }).click();
  await page.getByRole("button", { name: "Start fresh" }).click();
  await expect(page.locator(".profile-stats")).toContainText("0");
  await expect(page.locator(".profile-stats")).toContainText("14");
});
test("keyboard can dismiss a dialog and returns focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "I’m still in",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test("all routes fit a phone without horizontal overflow or console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["day", "night", "club"]) {
    await page.goto("/");
    await page.evaluate((t) => {
      const data = JSON.parse(localStorage.getItem("locked-in-v1")!);
      data.theme = t;
      localStorage.setItem("locked-in-v1", JSON.stringify(data));
    }, theme);
    await page.reload();
    for (const route of [
      "today",
      "crews",
      "crew/boys",
      "challenges",
      "challenge/november",
      "rankings",
      "profile",
      "lab",
      "welcome",
    ]) {
      await page.goto("/#" + route);
      await page.evaluate(() => document.fonts.ready);
      const sizes = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(sizes.scroll, `${theme}/${route}`).toBeLessThanOrEqual(
        sizes.width,
      );
    }
  }
  expect(errors).toEqual([]);
});
test("skip link focuses main without changing the route", async ({ page }) => {
  await page.goto("/#today");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await expect(page).toHaveURL(/#today$/);
  await expect(
    page.getByRole("heading", { name: "Small promises. Stronger together." }),
  ).toBeVisible();
});

test("a first check-in after restart only marks today on the calendar", async ({
  page,
}) => {
  await page.goto("/#profile");
  await page.getByRole("button", { name: "Restart", exact: false }).click();
  await page.getByRole("button", { name: "Start fresh" }).click();
  await page.goto("/#today");
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await page.getByRole("button", { name: "Just a note", exact: true }).click();
  await page
    .getByLabel("Your check-in", { exact: true })
    .fill("A fresh start.");
  await page.getByLabel("I kept my promise today.").check();
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await page
    .getByRole("button", { name: "Back to the crew", exact: true })
    .click();
  await expect(page.locator(".day-cell.complete")).toHaveCount(1);
  await expect(page.locator(".day-cell.today")).toHaveClass(/complete/);
});

import { test, expect, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
const origin = process.env.TEST_BASE_URL || "http://localhost:5173";
const password = "Local-test-only-2026!";
const photo = readFileSync("public/icon-192.png");

test("real accounts, private crews, invites, daily check-ins and photo permissions", async ({
  playwright,
}) => {
  const clients: APIRequestContext[] = [];
  async function account(name: string) {
    const client = await playwright.request.newContext({
      baseURL: origin,
      extraHTTPHeaders: { Origin: origin },
    });
    clients.push(client);
    const response = await client.post("/api/auth/sign-up/email", {
      data: { name, email: `${randomUUID()}@example.test`, password },
    });
    expect(response.status(), await response.text()).toBe(200);
    expect((await (await client.get("/api/state")).json()).crews).toEqual([]);
    return client;
  }
  try {
    const owner = await account("Owner");
    const friend = await account("Friend");
    const outsider = await account("Outsider");
    const create = await owner.post("/api/crews", {
      data: { name: "Private crew", timezone: "Asia/Dubai" },
    });
    expect(create.status(), await create.text()).toBe(201);
    const crewId = (await create.json()).id;
    const crew = (await (await owner.get(`/api/crews/${crewId}`)).json()).crew;
    expect((await outsider.get(`/api/crews/${crewId}`)).status()).toBe(404);
    expect(
      (
        await friend.post("/api/join", { data: { code: crew.inviteCode } })
      ).status(),
    ).toBe(200);
    const friendView = await (await friend.get(`/api/crews/${crewId}`)).json();
    expect(friendView.members).toHaveLength(2);
    expect(friendView.crew.inviteCode).toBeUndefined();
    expect(
      (await friend.post(`/api/crews/${crewId}/invite`, { data: {} })).status(),
    ).toBe(403);
    const start = await friend.post(`/api/crews/${crewId}/challenges`, {
      data: {
        name: "Keep the promise",
        description: "One honest day at a time.",
        days: 7,
      },
    });
    expect(start.status(), await start.text()).toBe(201);
    const challengeId = (await start.json()).id;
    expect(
      (await outsider.get(`/api/challenges/${challengeId}`)).status(),
    ).toBe(404);
    expect(
      (
        await owner.post(`/api/challenges/${challengeId}/checkins`, {
          multipart: { honest: "true", note: "Not joined" },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await owner.post(`/api/challenges/${challengeId}/join`, { data: {} })
      ).status(),
    ).toBe(200);
    expect(
      (
        await owner.post(`/api/challenges/${challengeId}/checkins`, {
          multipart: { note: "No honesty confirmation" },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await owner.post(`/api/challenges/${challengeId}/checkins`, {
          multipart: {
            honest: "true",
            photo: {
              name: "bad.png",
              mimeType: "image/png",
              buffer: Buffer.from("<svg onload=alert(1)>"),
            },
          },
        })
      ).status(),
    ).toBe(400);
    const check = await owner.post(`/api/challenges/${challengeId}/checkins`, {
      multipart: {
        honest: "true",
        note: "An ordinary moment.",
        photo: { name: "day.png", mimeType: "image/png", buffer: photo },
      },
    });
    expect(check.status(), await check.text()).toBe(201);
    const checkId = (await check.json()).id;
    expect(
      (
        await owner.post(`/api/challenges/${challengeId}/checkins`, {
          multipart: { honest: "true", note: "Duplicate" },
        })
      ).status(),
    ).toBe(409);
    const image = await friend.get(`/api/photos/${checkId}`);
    expect(image.status()).toBe(200);
    expect(image.headers()["cache-control"]).toContain("no-store");
    expect(await image.body()).toEqual(photo);
    expect((await outsider.get(`/api/photos/${checkId}`)).status()).toBe(404);
    expect((await friend.delete(`/api/checkins/${checkId}`)).status()).toBe(
      404,
    );
    const details = await (
      await friend.get(`/api/challenges/${challengeId}`)
    ).json();
    expect(details.rankings[0]).toMatchObject({
      name: "Owner",
      current: 1,
      total: 1,
      checkedIn: true,
    });
    expect(
      (
        await owner.post("/api/crews", {
          headers: { Origin: "https://evil.example" },
          data: { name: "CSRF", timezone: "UTC" },
        })
      ).status(),
    ).toBe(403);
    await owner.post(`/api/crews/${crewId}/invite`, { data: {} });
    expect(
      (
        await outsider.post("/api/join", { data: { code: crew.inviteCode } })
      ).status(),
    ).toBe(404);
    const pair = await Promise.all(
      [1, 2].map(() =>
        friend.post(`/api/challenges/${challengeId}/checkins`, {
          multipart: { honest: "true", note: "One only" },
        }),
      ),
    );
    expect(pair.map((r) => r.status()).sort()).toEqual([201, 409]);
    const friendCheck = (
      await (await friend.get(`/api/challenges/${challengeId}`)).json()
    ).feed.find((f: { name: string }) => f.name === "Friend").id;
    expect(
      (await friend.post(`/api/crews/${crewId}/leave`, { data: {} })).status(),
    ).toBe(200);
    expect((await friend.get(`/api/photos/${checkId}`)).status()).toBe(404);
    expect((await owner.get(`/api/photos/${friendCheck}`)).status()).toBe(404);
    expect((await owner.delete(`/api/checkins/${checkId}`)).status()).toBe(200);
    const final = await (
      await owner.get(`/api/challenges/${challengeId}`)
    ).json();
    expect(final.feed).toEqual([]);
    expect(final.rankings).toHaveLength(1);
    expect(final.rankings[0].total).toBe(0);
  } finally {
    await Promise.all(clients.map((c) => c.dispose()));
  }
});

test("complete simple mobile journey, persistence, login and accessible empty states", async ({
  page,
}) => {
  const email = `${randomUUID()}@example.test`;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Stay in. Together." }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/simple-auth-mobile.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await page.getByLabel("Your name").fill("Journey tester");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Better with your people." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create a crew", exact: true })
    .click();
  await page.getByLabel("Crew name").fill("The real crew");
  await page.getByRole("button", { name: "Create crew", exact: true }).click();
  await page
    .getByRole("button", { name: "Create a challenge", exact: true })
    .click();
  await page.getByLabel("Challenge name").fill("Seven days together");
  await page
    .getByLabel("The promise")
    .fill("We keep our promise and check in honestly.");
  await page.getByLabel("Duration").selectOption("7");
  await page
    .getByRole("button", { name: "Start challenge", exact: true })
    .click();
  await page.getByRole("button", { name: "I’m still in", exact: true }).click();
  await page.getByLabel("Your note").fill("Day one, done.");
  await page
    .getByLabel("Choose check-in photo")
    .setInputFiles({
      name: "moment.png",
      mimeType: "image/png",
      buffer: photo,
    });
  await expect(page.getByAltText("Selected check-in photo")).toBeVisible();
  await page.getByRole("checkbox").check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("button", { name: "I’m still in", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("button", { name: "Checked in today" }),
  ).toBeDisabled();
  await expect(page.getByText("Day one, done.")).toBeVisible();
  await page.screenshot({
    path: "artifacts/simple-today-mobile.png",
    fullPage: true,
  });
  await page.reload();
  await expect(page.getByText("Day one, done.")).toBeVisible();
  await page.getByRole("button", { name: "Leaderboard", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Crew", exact: true }).click();
  await page.getByRole("button", { name: "Invite friends" }).click();
  await expect(page.getByLabel("Invite link", { exact: true })).toHaveValue(
    /\/join\/[a-f0-9]{32}$/,
  );
  const invitation = await page
    .getByLabel("Invite link", { exact: true })
    .inputValue();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("heading", { name: "Stay in. Together." }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The real crew", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/simple-today-desktop.png",
    fullPage: true,
  });
  const guest = await page.context().browser()!.newContext();
  const friend = await guest.newPage();
  await friend.goto(invitation);
  await friend
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await friend.getByLabel("Your name").fill("Invited friend");
  await friend
    .getByLabel("Email", { exact: true })
    .fill(`${randomUUID()}@example.test`);
  await friend.getByLabel("Password", { exact: true }).fill(password);
  await friend
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    friend.getByRole("heading", { name: "Join your friends", exact: true }),
  ).toBeVisible();
  await friend.getByRole("button", { name: "Join crew", exact: true }).click();
  await friend
    .getByRole("button", { name: "Join challenge", exact: true })
    .click();
  await expect(
    friend.getByRole("button", { name: "I’m still in", exact: true }),
  ).toBeEnabled();
  await guest.close();
});

test("installable shell shows a reconnect screen without caching private data", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Stay in. Together." }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Stay in. Together." }),
  ).toBeVisible();
  const cached = await page.evaluate(async () =>
    (
      await Promise.all(
        (await caches.keys()).map(async (key) =>
          (await (await caches.open(key)).keys()).map(
            (r) => new URL(r.url).pathname,
          ),
        ),
      )
    ).flat(),
  );
  expect(cached.sort()).toEqual(["/icon.svg", "/offline.html"]);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "You’re offline." }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("link", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Stay in. Together." }),
  ).toBeVisible();
});

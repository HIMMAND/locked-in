import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { env } from "./env";
export async function auth() {
  const e = await env();
  return betterAuth({
    appName: "LOCKED IN",
    baseURL: e.BETTER_AUTH_URL,
    secret: e.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(e.DB, { schema }), {
      provider: "sqlite",
      schema,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-up/email": { window: 60, max: 5 },
        "/sign-in/email": { window: 60, max: 10 },
      },
    },
    advanced: {
      cookiePrefix: "locked-in",
      // Cloudflare overwrites this header, so callers cannot choose a rate-limit bucket.
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      defaultCookieAttributes: { sameSite: "lax", httpOnly: true },
    },
    user: { deleteUser: { enabled: false } },
  });
}

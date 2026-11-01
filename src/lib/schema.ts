import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
const stamp = (name: string) => integer(name, { mode: "timestamp_ms" });
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: stamp("createdAt").notNull(),
  updatedAt: stamp("updatedAt").notNull(),
});
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: stamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: stamp("createdAt").notNull(),
  updatedAt: stamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: stamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: stamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: stamp("createdAt").notNull(),
  updatedAt: stamp("updatedAt").notNull(),
});
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: stamp("expiresAt").notNull(),
  createdAt: stamp("createdAt").notNull(),
  updatedAt: stamp("updatedAt").notNull(),
});
export const rateLimit = sqliteTable("rateLimit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("lastRequest", { mode: "number" }).notNull(),
});

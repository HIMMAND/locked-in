import { z } from "zod";
import { auth } from "./auth";
import { env } from "./env";
import { dayInZone, addDays, streakStats } from "./streak.mjs";
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const fail = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
const result = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
const name = z
  .string()
  .trim()
  .min(1, "Enter a name.")
  .max(40, "Keep the name under 40 characters.");
async function bytes(req: Request, max: number) {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      fail(413, "That file is too large. Choose a smaller photo.");
    }
    chunks.push(value);
  }
  const output = new Uint8Array(size);
  let pos = 0;
  for (const chunk of chunks) {
    output.set(chunk, pos);
    pos += chunk.length;
  }
  return output;
}
async function json(req: Request) {
  try {
    return JSON.parse(new TextDecoder().decode(await bytes(req, 16384)));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    return fail(400, "Send valid form data.");
  }
}
type MemberCrew = {
  id: string;
  name: string;
  ownerId: string;
  timezone: string;
  inviteCode: string;
  inviteCreatedAt: number;
};
async function crewAccess(db: D1Database, crewId: string, userId: string) {
  const c = await db
    .prepare(
      "SELECT c.* FROM crews c JOIN members m ON m.crewId=c.id WHERE c.id=? AND m.userId=?",
    )
    .bind(crewId, userId)
    .first<MemberCrew>();
  if (!c) fail(404, "Crew not found. Ask a friend for an invite.");
  return c!;
}
async function challengeAccess(db: D1Database, id: string, userId: string) {
  const c = await db
    .prepare(
      "SELECT c.*,g.timezone FROM challenges c JOIN crews g ON g.id=c.crewId JOIN members m ON m.crewId=g.id WHERE c.id=? AND m.userId=?",
    )
    .bind(id, userId)
    .first<{
      id: string;
      crewId: string;
      name: string;
      description: string;
      days: number;
      startDay: string;
      endDay: string;
      timezone: string;
    }>();
  if (!c) fail(404, "Challenge not found.");
  return c!;
}
async function throttle(db: D1Database, userId: string) {
  const now = Date.now();
  const row = await db
    .prepare(
      "INSERT INTO appRateLimits(key,count,resetAt) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN resetAt<=? THEN 1 ELSE count+1 END,resetAt=CASE WHEN resetAt<=? THEN ? ELSE resetAt END RETURNING count",
    )
    .bind(userId, now + 60000, now, now, now + 60000)
    .first<{ count: number }>();
  if ((row?.count || 0) > 60) fail(429, "Take a moment, then try again.");
}
export async function handle(request: Request, path: string[]) {
  try {
    const e = await env();
    const db = e.DB;
    const session = await (
      await auth()
    ).api.getSession({ headers: request.headers });
    if (!session) fail(401, "Sign in to continue.");
    const userId = session!.user.id;
    const method = request.method;
    if (method !== "GET") {
      if (request.headers.get("origin") !== new URL(e.BETTER_AUTH_URL).origin)
        fail(403, "Please refresh the app and try again.");
      await throttle(db, userId);
    }
    if (path[0] === "state" && method === "GET") {
      const crews = await db
        .prepare(
          "SELECT c.id,c.name,c.ownerId,c.timezone,(SELECT COUNT(*) FROM members WHERE crewId=c.id) AS members FROM crews c JOIN members m ON m.crewId=c.id WHERE m.userId=? ORDER BY c.createdAt DESC",
        )
        .bind(userId)
        .all();
      return result({
        user: {
          id: userId,
          name: session!.user.name,
          email: session!.user.email,
        },
        crews: crews.results,
      });
    }
    if (path[0] === "crews" && path.length === 1 && method === "POST") {
      const input = z
        .object({ name, timezone: z.string().max(80) })
        .parse(await json(request));
      try {
        dayInZone(input.timezone);
      } catch {
        fail(400, "Choose a valid timezone.");
      }
      const count = await db
        .prepare("SELECT COUNT(*) AS n FROM crews WHERE ownerId=?")
        .bind(userId)
        .first<{ n: number }>();
      if ((count?.n || 0) >= 20) fail(400, "You can own up to 20 crews.");
      const id = crypto.randomUUID();
      const code = crypto.randomUUID().replaceAll("-", "");
      const now = Date.now();
      await db.batch([
        db
          .prepare(
            "INSERT INTO crews(id,name,ownerId,timezone,inviteCode,inviteCreatedAt,createdAt) VALUES(?,?,?,?,?,?,?)",
          )
          .bind(id, input.name, userId, input.timezone, code, now, now),
        db
          .prepare("INSERT INTO members(crewId,userId,joinedAt) VALUES(?,?,?)")
          .bind(id, userId, now),
      ]);
      return result({ id }, 201);
    }
    if (path[0] === "join" && method === "POST") {
      const input = z
        .object({
          code: z
            .string()
            .trim()
            .regex(/^[a-f0-9]{32}$/i, "Enter the full invite code."),
        })
        .parse(await json(request));
      const crew = await db
        .prepare("SELECT id,inviteCreatedAt FROM crews WHERE inviteCode=?")
        .bind(input.code.toLowerCase())
        .first<{ id: string; inviteCreatedAt: number }>();
      if (!crew || Date.now() - crew.inviteCreatedAt > 30 * 86400000)
        fail(404, "This invite has expired. Ask the crew owner for a new one.");
      const joined = await db
        .prepare("SELECT 1 FROM members WHERE crewId=? AND userId=?")
        .bind(crew!.id, userId)
        .first();
      if (!joined) {
        const count = await db
          .prepare("SELECT COUNT(*) AS n FROM members WHERE crewId=?")
          .bind(crew!.id)
          .first<{ n: number }>();
        if ((count?.n || 0) >= 100) fail(400, "This crew is full.");
        await db
          .prepare(
            "INSERT OR IGNORE INTO members(crewId,userId,joinedAt) VALUES(?,?,?)",
          )
          .bind(crew!.id, userId, Date.now())
          .run();
      }
      return result({ id: crew!.id });
    }
    if (path[0] === "crews" && path[1]) {
      const crew = await crewAccess(db, path[1], userId);
      if (path.length === 2 && method === "GET") {
        const members = await db
          .prepare(
            "SELECT u.id,u.name FROM members m JOIN user u ON u.id=m.userId WHERE m.crewId=? ORDER BY m.joinedAt",
          )
          .bind(crew.id)
          .all();
        const challenges = await db
          .prepare(
            "SELECT c.*,EXISTS(SELECT 1 FROM participants p WHERE p.challengeId=c.id AND p.userId=?) AS joined,(SELECT COUNT(*) FROM participants WHERE challengeId=c.id) AS participants FROM challenges c WHERE c.crewId=? ORDER BY c.createdAt DESC LIMIT 100",
          )
          .bind(userId, crew.id)
          .all();
        const { inviteCode, inviteCreatedAt, ...safeCrew } = crew;
        return result({
          crew: {
            ...safeCrew,
            members: members.results.length,
            ...(crew.ownerId === userId ? { inviteCode, inviteCreatedAt } : {}),
          },
          members: members.results,
          challenges: challenges.results.map((c) => ({
            ...c,
            joined: !!c.joined,
          })),
          today: dayInZone(crew.timezone),
        });
      }
      if (path[2] === "invite" && method === "POST") {
        if (crew.ownerId !== userId)
          fail(403, "Only the crew owner can create invite links.");
        const code = crypto.randomUUID().replaceAll("-", "");
        await db
          .prepare("UPDATE crews SET inviteCode=?,inviteCreatedAt=? WHERE id=?")
          .bind(code, Date.now(), crew.id)
          .run();
        return result({ code });
      }
      if (path[2] === "leave" && method === "POST") {
        if (crew.ownerId === userId)
          fail(400, "The crew owner can’t leave their own crew.");
        await db.batch([
          db
            .prepare(
              "DELETE FROM participants WHERE userId=? AND challengeId IN (SELECT id FROM challenges WHERE crewId=?)",
            )
            .bind(userId, crew.id),
          db
            .prepare("DELETE FROM members WHERE crewId=? AND userId=?")
            .bind(crew.id, userId),
        ]);
        return result({ ok: true });
      }
      if (path[2] === "challenges" && method === "POST") {
        const input = z
          .object({
            name,
            description: z
              .string()
              .trim()
              .min(1, "Describe the promise.")
              .max(240),
            days: z.number().int().min(1).max(90),
          })
          .parse(await json(request));
        const count = await db
          .prepare("SELECT COUNT(*) AS n FROM challenges WHERE crewId=?")
          .bind(crew.id)
          .first<{ n: number }>();
        if ((count?.n || 0) >= 100)
          fail(400, "This crew has reached its 100-challenge limit.");
        const id = crypto.randomUUID();
        const today = dayInZone(crew.timezone);
        await db.batch([
          db
            .prepare(
              "INSERT INTO challenges(id,crewId,name,description,days,startDay,endDay,creatorId,createdAt) VALUES(?,?,?,?,?,?,?,?,?)",
            )
            .bind(
              id,
              crew.id,
              input.name,
              input.description,
              input.days,
              today,
              addDays(today, input.days - 1),
              userId,
              Date.now(),
            ),
          db
            .prepare(
              "INSERT INTO participants(challengeId,userId,joinedDay) VALUES(?,?,?)",
            )
            .bind(id, userId, today),
        ]);
        return result({ id }, 201);
      }
    }
    if (path[0] === "challenges" && path[1]) {
      const challenge = await challengeAccess(db, path[1], userId);
      const today = dayInZone(challenge.timezone);
      if (path.length === 2 && method === "GET") {
        const people = await db
          .prepare(
            "SELECT u.id,u.name FROM participants p JOIN user u ON u.id=p.userId WHERE p.challengeId=?",
          )
          .bind(challenge.id)
          .all<{ id: string; name: string }>();
        const days = await db
          .prepare(
            "SELECT userId,day FROM checkins WHERE challengeId=? ORDER BY day",
          )
          .bind(challenge.id)
          .all<{ userId: string; day: string }>();
        const rankings = people.results
          .map((p) => ({
            ...p,
            ...streakStats(
              days.results.filter((d) => d.userId === p.id).map((d) => d.day),
              today,
            ),
          }))
          .sort(
            (a, b) =>
              b.current - a.current ||
              b.total - a.total ||
              a.name.localeCompare(b.name),
          );
        const feed = await db
          .prepare(
            "SELECT c.id,c.userId,u.name,c.day,c.note,(c.photo IS NOT NULL) AS hasPhoto,c.createdAt FROM checkins c JOIN user u ON u.id=c.userId WHERE c.challengeId=? ORDER BY c.createdAt DESC LIMIT 30",
          )
          .bind(challenge.id)
          .all();
        return result({
          challenge: {
            ...challenge,
            joined: people.results.some((p) => p.id === userId),
            participants: people.results.length,
          },
          today,
          rankings,
          feed: feed.results.map((f) => ({ ...f, hasPhoto: !!f.hasPhoto })),
          myDays: days.results
            .filter((d) => d.userId === userId)
            .map((d) => d.day),
        });
      }
      if (path[2] === "join" && method === "POST") {
        if (today > challenge.endDay)
          fail(
            400,
            "This challenge has finished. Start a new one with your crew.",
          );
        await db
          .prepare(
            "INSERT OR IGNORE INTO participants(challengeId,userId,joinedDay) VALUES(?,?,?)",
          )
          .bind(challenge.id, userId, today)
          .run();
        return result({ ok: true });
      }
      if (path[2] === "checkins" && method === "POST") {
        if (today < challenge.startDay || today > challenge.endDay)
          fail(400, "This challenge is not active today.");
        const participant = await db
          .prepare(
            "SELECT 1 FROM participants WHERE challengeId=? AND userId=?",
          )
          .bind(challenge.id, userId)
          .first();
        if (!participant) fail(403, "Join this challenge before checking in.");
        const content = await bytes(request, 320000);
        const form = await new Request(request.url, {
          method: "POST",
          headers: {
            "Content-Type": request.headers.get("content-type") || "",
          },
          body: content,
        })
          .formData()
          .catch(() => fail(400, "Send a valid photo or note."));
        const note = z
          .string()
          .trim()
          .max(280, "Keep your note under 280 characters.")
          .parse(form.get("note") || "");
        if (form.get("honest") !== "true")
          fail(400, "Confirm that this is an honest check-in.");
        const file = form.get("photo");
        let photo: ArrayBuffer | null = null;
        let photoType: string | null = null;
        if (file instanceof File && file.size) {
          if (file.size > 262144)
            fail(413, "Choose a photo smaller than 256 KB.");
          const data = new Uint8Array(await file.arrayBuffer());
          const jpg = data[0] === 255 && data[1] === 216 && data[2] === 255;
          const png =
            data[0] === 137 &&
            data[1] === 80 &&
            data[2] === 78 &&
            data[3] === 71 &&
            data[4] === 13 &&
            data[5] === 10 &&
            data[6] === 26 &&
            data[7] === 10;
          if (!jpg && !png) fail(400, "Choose a JPG or PNG photo.");
          photo = data.buffer;
          photoType = jpg ? "image/jpeg" : "image/png";
        }
        if (!photo && !note) fail(400, "Add a photo or a short note.");
        const id = crypto.randomUUID();
        const inserted = await db
          .prepare(
            "INSERT OR IGNORE INTO checkins(id,challengeId,userId,day,note,photo,photoType,createdAt) VALUES(?,?,?,?,?,?,?,?) RETURNING id",
          )
          .bind(
            id,
            challenge.id,
            userId,
            today,
            note,
            photo,
            photoType,
            Date.now(),
          )
          .first();
        if (!inserted)
          fail(409, "You already checked in today. Come back tomorrow.");
        return result({ id }, 201);
      }
    }
    if (path[0] === "photos" && path[1] && method === "GET") {
      const row = await db
        .prepare(
          "SELECT c.photo,c.photoType FROM checkins c JOIN challenges h ON h.id=c.challengeId JOIN members m ON m.crewId=h.crewId WHERE c.id=? AND m.userId=?",
        )
        .bind(path[1], userId)
        .first<{ photo: number[] | ArrayBuffer; photoType: string }>();
      if (!row?.photo) fail(404, "Photo not found.");
      const blob =
        row!.photo instanceof ArrayBuffer
          ? row!.photo
          : new Uint8Array(row!.photo);
      return new Response(blob, {
        headers: {
          "Content-Type": row!.photoType,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Disposition": "inline",
        },
      });
    }
    if (path[0] === "checkins" && path[1] && method === "DELETE") {
      const deleted = await db
        .prepare("DELETE FROM checkins WHERE id=? AND userId=? RETURNING id")
        .bind(path[1], userId)
        .first();
      if (!deleted) fail(404, "Check-in not found.");
      return result({ ok: true });
    }
    return fail(404, "Not found.");
  } catch (error) {
    if (error instanceof HttpError)
      return result({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return result(
        { error: error.issues[0]?.message || "Check your inputs." },
        400,
      );
    console.error(
      "API request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return result({ error: "Something went wrong. Please try again." }, 500);
  }
}

import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { analysisSessions, games, InsertUser, lessonProgress, puzzleAttempts, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

type GameMode = "local" | "computer" | "imported";
type GameStatus = "active" | "completed" | "abandoned";
type LessonStatus = "not_started" | "in_progress" | "completed";
type PuzzleResult = "solved" | "failed" | "abandoned";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("ChessIQ database is not available");
  return db;
}

function insertId(result: unknown) {
  const id = Number((result as { insertId?: number }).insertId);
  if (!Number.isInteger(id) || id < 1) throw new Error("Database did not return an inserted record id");
  return id;
}

export async function listGamesForUser(userId: number) {
  const db = await requireDb();
  return db.select().from(games).where(eq(games.userId, userId)).orderBy(desc(games.updatedAt));
}

export async function getGameForUser(userId: number, gameId: number) {
  const db = await requireDb();
  const rows = await db.select().from(games).where(and(eq(games.id, gameId), eq(games.userId, userId))).limit(1);
  return rows[0] ?? null;
}

export async function createGameForUser(input: { userId: number; title: string; mode: GameMode; initialFen: string; moves: string[]; pgn: string }) {
  const db = await requireDb();
  const result = await db.insert(games).values({
    userId: input.userId,
    title: input.title,
    mode: input.mode,
    initialFen: input.initialFen,
    currentFen: input.initialFen,
    moves: input.moves,
    pgn: input.pgn,
  });
  const record = await getGameForUser(input.userId, insertId(result));
  if (!record) throw new Error("Game could not be read after creation");
  return record;
}

export async function updateGameForUser(input: { userId: number; gameId: number; currentFen: string; moves: string[]; pgn: string; status: GameStatus; result: string | null }) {
  const db = await requireDb();
  await db.update(games).set({ currentFen: input.currentFen, moves: input.moves, pgn: input.pgn, status: input.status, result: input.result }).where(and(eq(games.id, input.gameId), eq(games.userId, input.userId)));
  const record = await getGameForUser(input.userId, input.gameId);
  if (!record) throw new Error("Game was not found or is no longer available");
  return record;
}

export async function createAnalysisForUser(input: { userId: number; gameId?: number; positionFen: string; depth: number; bestMove: string; scoreCp: number; principalVariation: string; engine: string }) {
  const db = await requireDb();
  const result = await db.insert(analysisSessions).values({ ...input, gameId: input.gameId ?? null });
  const id = insertId(result);
  const rows = await db.select().from(analysisSessions).where(and(eq(analysisSessions.id, id), eq(analysisSessions.userId, input.userId))).limit(1);
  if (!rows[0]) throw new Error("Analysis could not be read after creation");
  return rows[0];
}

export async function listAnalysesForUser(userId: number, gameId?: number) {
  const db = await requireDb();
  const condition = gameId ? and(eq(analysisSessions.userId, userId), eq(analysisSessions.gameId, gameId)) : eq(analysisSessions.userId, userId);
  return db.select().from(analysisSessions).where(condition).orderBy(desc(analysisSessions.createdAt));
}

export async function upsertLessonProgress(input: { userId: number; lessonKey: string; status: LessonStatus; completedSteps: number }) {
  const db = await requireDb();
  const values = { ...input, completedAt: input.status === "completed" ? new Date() : null };
  await db.insert(lessonProgress).values(values).onDuplicateKeyUpdate({ set: { status: values.status, completedSteps: values.completedSteps, completedAt: values.completedAt } });
  const rows = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, input.userId), eq(lessonProgress.lessonKey, input.lessonKey))).limit(1);
  if (!rows[0]) throw new Error("Lesson progress could not be read");
  return rows[0];
}

export async function listLessonProgressForUser(userId: number) {
  const db = await requireDb();
  return db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId)).orderBy(desc(lessonProgress.updatedAt));
}

export async function createPuzzleAttempt(input: { userId: number; puzzleKey: string; moves: string[]; result: PuzzleResult }) {
  const db = await requireDb();
  const result = await db.insert(puzzleAttempts).values({ ...input, completedAt: input.result === "solved" ? new Date() : null });
  const id = insertId(result);
  const rows = await db.select().from(puzzleAttempts).where(and(eq(puzzleAttempts.id, id), eq(puzzleAttempts.userId, input.userId))).limit(1);
  if (!rows[0]) throw new Error("Puzzle attempt could not be read");
  return rows[0];
}

export async function listPuzzleAttemptsForUser(userId: number) {
  const db = await requireDb();
  return db.select().from(puzzleAttempts).where(eq(puzzleAttempts.userId, userId)).orderBy(desc(puzzleAttempts.createdAt));
}

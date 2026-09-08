import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const games = mysqlTable("games", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 140 }).notNull(),
  mode: mysqlEnum("mode", ["local", "computer", "imported"]).notNull().default("local"),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).notNull().default("active"),
  initialFen: text("initialFen").notNull(),
  currentFen: text("currentFen").notNull(),
  moves: json("moves").$type<string[]>().notNull(),
  pgn: text("pgn").notNull(),
  result: varchar("result", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("games_user_updated_idx").on(table.userId, table.updatedAt)]);

export const analysisSessions = mysqlTable("analysisSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameId: int("gameId"),
  positionFen: text("positionFen").notNull(),
  depth: int("depth").notNull(),
  bestMove: varchar("bestMove", { length: 16 }).notNull(),
  scoreCp: int("scoreCp").notNull(),
  principalVariation: text("principalVariation").notNull(),
  engine: varchar("engine", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("analysis_user_created_idx").on(table.userId, table.createdAt), index("analysis_game_idx").on(table.gameId)]);

export const lessonProgress = mysqlTable("lessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonKey: varchar("lessonKey", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).notNull().default("not_started"),
  completedSteps: int("completedSteps").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
}, table => [uniqueIndex("lesson_progress_user_lesson_unique").on(table.userId, table.lessonKey)]);

export const puzzleAttempts = mysqlTable("puzzleAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  puzzleKey: varchar("puzzleKey", { length: 80 }).notNull(),
  moves: json("moves").$type<string[]>().notNull(),
  result: mysqlEnum("result", ["solved", "failed", "abandoned"]).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("puzzle_attempts_user_created_idx").on(table.userId, table.createdAt)]);

export const openingReviewItems = mysqlTable("openingReviewItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  openingNodeId: varchar("openingNodeId", { length: 255 }).notNull(),
  side: mysqlEnum("side", ["white", "black"]).notNull(),
  ease: int("ease").notNull().default(250),
  intervalDays: int("intervalDays").notNull().default(0),
  dueAt: timestamp("dueAt"),
  streak: int("streak").notNull().default(0),
  lapses: int("lapses").notNull().default(0),
  lastResult: mysqlEnum("lastResult", ["again", "hard", "good", "easy"]),
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("opening_review_user_node_side_unique").on(table.userId, table.openingNodeId, table.side),
  index("opening_review_user_due_idx").on(table.userId, table.dueAt),
]);

export const openingAttempts = mysqlTable("openingAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  openingNodeId: varchar("openingNodeId", { length: 255 }).notNull(),
  side: mysqlEnum("side", ["white", "black"]).notNull(),
  result: mysqlEnum("result", ["correct", "acceptable", "wrong"]).notNull(),
  responseMs: int("responseMs").notNull().default(0),
  usedHint: boolean("usedHint").notNull().default(false),
  rating: mysqlEnum("rating", ["again", "hard", "good", "easy"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("opening_attempt_user_created_idx").on(table.userId, table.createdAt),
  index("opening_attempt_user_node_idx").on(table.userId, table.openingNodeId),
]);

export type Game = typeof games.$inferSelect;
export type AnalysisSession = typeof analysisSessions.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type PuzzleAttempt = typeof puzzleAttempts.$inferSelect;
export type OpeningReviewItem = typeof openingReviewItems.$inferSelect;
export type OpeningAttempt = typeof openingAttempts.$inferSelect;

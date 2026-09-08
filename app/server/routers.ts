import { Chess } from "chess.js";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { ECO_CATALOG, getOpeningAncestors, getOpeningById, getOpeningBySlug, getOpeningChildren } from "@shared/openings/ecoCatalog";
import { searchOpenings } from "@shared/openings/search";
import { calculateOpeningMastery, scheduleOpeningReview, sortOpeningReviewQueue } from "@shared/openings/srs";
import {
  createAnalysisForUser,
  createGameForUser,
  createOpeningAttempt,
  createPuzzleAttempt,
  getGameForUser,
  getOpeningReviewItemForUser,
  listAnalysesForUser,
  listGamesForUser,
  listLessonProgressForUser,
  listOpeningAttemptsForUser,
  listOpeningReviewItemsForUser,
  listPuzzleAttemptsForUser,
  updateGameForUser,
  upsertLessonProgress,
  upsertOpeningReviewItem,
} from "./db";
import { lessonCatalog, puzzleCatalog } from "./catalog";
import { analyzeWithChessEngine } from "./engine";
import { getOpeningStats } from "./openingsStats";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const startingFen = new Chess().fen();
const gameModeSchema = z.enum(["local", "computer", "imported"]);
const gameInputSchema = z.object({ id: z.number().int().positive() });
const openingSideSchema = z.enum(["white", "black"]);
const openingRatingSchema = z.enum(["again", "hard", "good", "easy"]);
const openingMoveSchema = z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/);

function gameOutcome(chess: Chess) {
  if (!chess.isGameOver()) return { status: "active" as const, result: null };
  if (chess.isCheckmate()) return { status: "completed" as const, result: chess.turn() === "w" ? "0-1" : "1-0" };
  return { status: "completed" as const, result: "1/2-1/2" };
}

function replayPrefix(uci: readonly string[]) {
  const chess = new Chess();
  for (const move of uci) {
    chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] as "q" | "r" | "b" | "n" | undefined });
  }
  return chess;
}

const openingContinuationIndex = (() => {
  const index = new Map<string, Set<string>>();
  for (const node of ECO_CATALOG) {
    for (let ply = 0; ply < node.uci.length; ply++) {
      const prefix = node.uci.slice(0, ply).join(" ");
      const values = index.get(prefix) ?? new Set<string>();
      values.add(node.uci[ply]);
      index.set(prefix, values);
    }
  }
  return index;
})();

function continuationsForPrefix(prefix: readonly string[]) {
  return Array.from(openingContinuationIndex.get(prefix.join(" ")) ?? new Set<string>()).sort();
}

function openingCard(node: (typeof ECO_CATALOG)[number]) {
  return {
    id: node.id,
    slug: node.slug,
    eco: node.eco,
    name: node.name,
    aliases: node.aliases,
    pgn: node.pgn,
    san: node.san,
    uci: node.uci,
    epd: node.epd,
    depth: node.depth,
    summary: node.summary,
    ideasWhite: node.ideasWhite,
    ideasBlack: node.ideasBlack,
    trainable: node.trainable,
  };
}

function trainingQuestionsFor(node: (typeof ECO_CATALOG)[number], side: "white" | "black") {
  return node.uci.flatMap((canonicalMove, ply) => {
    const moveSide = ply % 2 === 0 ? "white" : "black";
    if (moveSide !== side) return [];
    const prefix = node.uci.slice(0, ply);
    const chess = replayPrefix(prefix);
    return [{
      openingNodeId: node.id,
      ply,
      fen: chess.fen(),
      canonicalMove,
      acceptableMoves: continuationsForPrefix(prefix),
      sanPlayed: node.san.slice(0, ply),
      explanation: (side === "white" ? node.ideasWhite : node.ideasBlack)?.[0] ?? node.summary ?? "Connect the move to development, central control, and the next thematic break.",
    }];
  });
}

function daysOverdue(dueAt: Date | null, now: Date) {
  if (!dueAt || dueAt.getTime() >= now.getTime()) return 0;
  return Math.floor((now.getTime() - dueAt.getTime()) / 86_400_000);
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  games: router({
    list: protectedProcedure.query(({ ctx }) => listGamesForUser(ctx.user.id)),
    get: protectedProcedure.input(gameInputSchema).query(({ ctx, input }) => getGameForUser(ctx.user.id, input.id)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(1).max(140).default("Untitled game"), mode: gameModeSchema.default("local") })).mutation(({ ctx, input }) => createGameForUser({ userId: ctx.user.id, title: input.title, mode: input.mode, initialFen: startingFen, moves: [], pgn: "" })),
    importPgn: protectedProcedure.input(z.object({ title: z.string().trim().min(1).max(140), pgn: z.string().trim().min(1).max(100_000) })).mutation(({ ctx, input }) => {
      const chess = new Chess();
      chess.loadPgn(input.pgn);
      const moves = chess.history({ verbose: true }).map(move => `${move.from}${move.to}${move.promotion ?? ""}`);
      return createGameForUser({ userId: ctx.user.id, title: input.title, mode: "imported", initialFen: startingFen, moves, pgn: chess.pgn() });
    }),
    move: protectedProcedure.input(z.object({ gameId: z.number().int().positive(), from: z.string().regex(/^[a-h][1-8]$/), to: z.string().regex(/^[a-h][1-8]$/), promotion: z.enum(["q", "r", "b", "n"]).optional() })).mutation(async ({ ctx, input }) => {
      const game = await getGameForUser(ctx.user.id, input.gameId);
      if (!game) throw new Error("Game not found");
      if (game.status !== "active") throw new Error("This game is already complete");
      const chess = new Chess(game.initialFen);
      for (const uci of game.moves) chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as "q" | "r" | "b" | "n" | undefined });
      const move = chess.move({ from: input.from, to: input.to, promotion: input.promotion });
      if (!move) throw new Error("That move is not legal in the current position");
      const moves = [...game.moves, `${move.from}${move.to}${move.promotion ?? ""}`];
      if (game.mode === "computer" && !chess.isGameOver()) {
        const response = await analyzeWithChessEngine(chess.fen(), 4);
        const computerMove = chess.move({ from: response.bestMove.slice(0, 2), to: response.bestMove.slice(2, 4), promotion: response.bestMove[4] as "q" | "r" | "b" | "n" | undefined });
        if (!computerMove) throw new Error("ChessEngine returned an invalid response");
        moves.push(`${computerMove.from}${computerMove.to}${computerMove.promotion ?? ""}`);
      }
      const outcome = gameOutcome(chess);
      return updateGameForUser({ userId: ctx.user.id, gameId: game.id, currentFen: chess.fen(), moves, pgn: chess.pgn(), ...outcome });
    }),
  }),
  analysis: router({
    list: protectedProcedure.input(z.object({ gameId: z.number().int().positive().optional() }).optional()).query(({ ctx, input }) => listAnalysesForUser(ctx.user.id, input?.gameId)),
    analyze: protectedProcedure.input(z.object({ fen: z.string().min(20).max(180), depth: z.number().int().min(1).max(8).default(6), gameId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      if (input.gameId && !await getGameForUser(ctx.user.id, input.gameId)) throw new Error("Game not found");
      const result = await analyzeWithChessEngine(input.fen, input.depth);
      return createAnalysisForUser({ userId: ctx.user.id, gameId: input.gameId, positionFen: input.fen, depth: result.depth, bestMove: result.bestMove, scoreCp: result.scoreCp, principalVariation: result.principalVariation, engine: result.engine });
    }),
  }),
  learn: router({
    catalog: publicProcedure.query(() => lessonCatalog),
    progress: protectedProcedure.query(({ ctx }) => listLessonProgressForUser(ctx.user.id)),
    saveProgress: protectedProcedure.input(z.object({ lessonKey: z.enum(["opening-principles", "tactical-motifs", "endgame-activity"]), status: z.enum(["not_started", "in_progress", "completed"]), completedSteps: z.number().int().min(0).max(20) })).mutation(({ ctx, input }) => upsertLessonProgress({ userId: ctx.user.id, ...input })),
  }),
  puzzles: router({
    catalog: publicProcedure.query(() => puzzleCatalog),
    attempts: protectedProcedure.query(({ ctx }) => listPuzzleAttemptsForUser(ctx.user.id)),
    submit: protectedProcedure.input(z.object({ puzzleKey: z.enum(["rook-lift", "central-break"]), moves: z.array(z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/)).max(16) })).mutation(({ ctx, input }) => {
      const puzzle = puzzleCatalog.find(item => item.key === input.puzzleKey);
      if (!puzzle) throw new Error("Puzzle not found");
      const solved = puzzle.solution.every((move, index) => input.moves[index] === move);
      return createPuzzleAttempt({ userId: ctx.user.id, puzzleKey: input.puzzleKey, moves: input.moves, result: solved ? "solved" : "failed" });
    }),
  }),
  openings: router({
    catalog: publicProcedure.input(z.object({ volume: z.enum(["A", "B", "C", "D", "E"]).optional(), offset: z.number().int().min(0).max(10_000).default(0), limit: z.number().int().min(1).max(100).default(48) }).optional()).query(({ input }) => {
      const volume = input?.volume;
      const offset = input?.offset ?? 0;
      const limit = input?.limit ?? 48;
      const filtered = ECO_CATALOG.filter(node => !volume || node.eco.startsWith(volume));
      const page = [...filtered].sort((a, b) => a.eco.localeCompare(b.eco) || a.depth - b.depth || a.name.localeCompare(b.name)).slice(offset, offset + limit);
      return { total: filtered.length, offset, limit, items: page.map(openingCard) };
    }),
    search: publicProcedure.input(z.object({ query: z.string().trim().max(160).default(""), limit: z.number().int().min(1).max(100).default(60) })).query(({ input }) => searchOpenings(input.query, input.limit).map(openingCard)),
    detail: publicProcedure.input(z.object({ slug: z.string().trim().min(1).max(320) })).query(({ input }) => {
      const node = getOpeningBySlug(input.slug);
      if (!node) throw new Error("Opening not found");
      return {
        opening: openingCard(node),
        ancestors: getOpeningAncestors(node.id).map(openingCard),
        children: getOpeningChildren(node.id).map(openingCard),
      };
    }),
    stats: publicProcedure.input(z.object({ fen: z.string().min(20).max(180) })).query(({ input }) => getOpeningStats(input.fen)),
    trainingLine: publicProcedure.input(z.object({ slug: z.string().trim().min(1).max(320), side: openingSideSchema })).query(({ input }) => {
      const node = getOpeningBySlug(input.slug);
      if (!node) throw new Error("Opening not found");
      return { opening: openingCard(node), side: input.side, questions: trainingQuestionsFor(node, input.side) };
    }),
    progress: protectedProcedure.query(async ({ ctx }) => {
      const now = new Date();
      const [reviews, attempts] = await Promise.all([
        listOpeningReviewItemsForUser(ctx.user.id),
        listOpeningAttemptsForUser(ctx.user.id),
      ]);
      const attemptsByNode = new Map<string, typeof attempts>();
      for (const attempt of attempts) {
        const values = attemptsByNode.get(`${attempt.openingNodeId}|${attempt.side}`) ?? [];
        values.push(attempt);
        attemptsByNode.set(`${attempt.openingNodeId}|${attempt.side}`, values);
      }
      const items = reviews.flatMap(review => {
        const node = getOpeningById(review.openingNodeId);
        if (!node) return [];
        const history = attemptsByNode.get(`${review.openingNodeId}|${review.side}`) ?? [];
        const accuracy = history.length ? history.filter(attempt => attempt.result !== "wrong").length / history.length : 0;
        const retention = review.streak / Math.max(1, review.streak + review.lapses + 1);
        const mastery = calculateOpeningMastery([{
          accuracy,
          retention,
          overdueDays: daysOverdue(review.dueAt, now),
          intervalDays: review.intervalDays,
          criticalWeight: node.trainable ? 1.5 : 1,
          reviewed: Boolean(review.lastReviewedAt),
        }]);
        return [{
          opening: openingCard(node),
          side: review.side,
          dueAt: review.dueAt,
          streak: review.streak,
          lapses: review.lapses,
          intervalDays: review.intervalDays,
          accuracy,
          mastery,
        }];
      });
      const dueCount = reviews.filter(review => review.dueAt && review.dueAt.getTime() <= now.getTime()).length;
      const sideSummary = (side: "white" | "black") => {
        const sideItems = items.filter(item => item.side === side);
        return {
          lines: sideItems.length,
          due: sideItems.filter(item => item.dueAt && item.dueAt.getTime() <= now.getTime()).length,
          averageMastery: sideItems.length ? Math.round(sideItems.reduce((total, item) => total + item.mastery.score, 0) / sideItems.length) : 0,
        };
      };
      const recent = attempts.slice(0, 100);
      const recentAccuracy = recent.length ? recent.filter(attempt => attempt.result !== "wrong").length / recent.length : 0;
      return {
        dueCount,
        recentAccuracy,
        white: sideSummary("white"),
        black: sideSummary("black"),
        weakest: [...items].sort((a, b) => a.mastery.score - b.mastery.score || b.lapses - a.lapses).slice(0, 6),
        items,
      };
    }),
    queue: protectedProcedure.input(z.object({ side: openingSideSchema.optional(), limit: z.number().int().min(1).max(100).default(30) }).optional()).query(async ({ ctx, input }) => {
      const now = new Date();
      const reviews = await listOpeningReviewItemsForUser(ctx.user.id);
      const selected = reviews.filter(review => !input?.side || review.side === input.side);
      return sortOpeningReviewQueue(selected.map(review => ({
        id: `${review.openingNodeId}|${review.side}`,
        dueAt: review.dueAt,
        lapses: review.lapses,
        criticalWeight: getOpeningById(review.openingNodeId)?.trainable ? 1.5 : 1,
        isNew: !review.lastReviewedAt,
        review,
      })), now).slice(0, input?.limit ?? 30).flatMap(item => {
        const node = getOpeningById(item.review.openingNodeId);
        return node ? [{ opening: openingCard(node), side: item.review.side, dueAt: item.review.dueAt, lapses: item.review.lapses }] : [];
      });
    }),
    recordAttempt: protectedProcedure.input(z.object({
      openingNodeId: z.string().min(1).max(255),
      ply: z.number().int().min(0).max(80),
      side: openingSideSchema,
      moveUci: openingMoveSchema,
      responseMs: z.number().int().min(0).max(3_600_000),
      usedHint: z.boolean().default(false),
      rating: openingRatingSchema,
    })).mutation(async ({ ctx, input }) => {
      const node = getOpeningById(input.openingNodeId);
      if (!node) throw new Error("Opening line not found");
      const canonicalMove = node.uci[input.ply];
      if (!canonicalMove) throw new Error("Trainer question is outside this opening line");
      const moveSide = input.ply % 2 === 0 ? "white" : "black";
      if (moveSide !== input.side) throw new Error("Trainer side does not match the question position");
      const prefix = node.uci.slice(0, input.ply);
      const chess = replayPrefix(prefix);
      let legalMove;
      try {
        legalMove = chess.move({ from: input.moveUci.slice(0, 2), to: input.moveUci.slice(2, 4), promotion: input.moveUci[4] as "q" | "r" | "b" | "n" | undefined });
      } catch {
        legalMove = null;
      }
      if (!legalMove) throw new Error("That move is not legal in the trainer position");
      const played = `${legalMove.from}${legalMove.to}${legalMove.promotion ?? ""}`;
      const alternatives = continuationsForPrefix(prefix);
      const result = played === canonicalMove ? "correct" as const : alternatives.includes(played) ? "acceptable" as const : "wrong" as const;
      const effectiveRating = result === "wrong" ? "again" as const : input.rating;
      const current = await getOpeningReviewItemForUser(ctx.user.id, node.id, input.side);
      const scheduled = scheduleOpeningReview(current ? {
        ease: current.ease,
        intervalDays: current.intervalDays,
        streak: current.streak,
        lapses: current.lapses,
      } : undefined, effectiveRating, new Date());
      await createOpeningAttempt({
        userId: ctx.user.id,
        openingNodeId: node.id,
        side: input.side,
        result,
        responseMs: input.responseMs,
        usedHint: input.usedHint,
        rating: effectiveRating,
      });
      const review = await upsertOpeningReviewItem({
        userId: ctx.user.id,
        openingNodeId: node.id,
        side: input.side,
        ease: scheduled.ease,
        intervalDays: scheduled.intervalDays,
        dueAt: scheduled.dueAt,
        streak: scheduled.streak,
        lapses: scheduled.lapses,
        lastResult: scheduled.lastResult,
        lastReviewedAt: scheduled.lastReviewedAt,
      });
      return { result, canonicalMove, acceptableMoves: alternatives, review };
    }),
  }),
});

export type AppRouter = typeof appRouter;

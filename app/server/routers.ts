import { Chess } from "chess.js";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { createAnalysisForUser, createGameForUser, createPuzzleAttempt, getGameForUser, listAnalysesForUser, listGamesForUser, listLessonProgressForUser, listPuzzleAttemptsForUser, updateGameForUser, upsertLessonProgress } from "./db";
import { lessonCatalog, puzzleCatalog } from "./catalog";
import { analyzeWithChessEngine } from "./engine";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const startingFen = new Chess().fen();
const gameModeSchema = z.enum(["local", "computer", "imported"]);
const gameInputSchema = z.object({ id: z.number().int().positive() });

function gameOutcome(chess: Chess) {
  if (!chess.isGameOver()) return { status: "active" as const, result: null };
  if (chess.isCheckmate()) return { status: "completed" as const, result: chess.turn() === "w" ? "0-1" : "1-0" };
  return { status: "completed" as const, result: "1/2-1/2" };
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
});

export type AppRouter = typeof appRouter;

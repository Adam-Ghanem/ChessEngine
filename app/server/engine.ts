import { Chess } from "chess.js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type EngineAnalysis = { bestMove: string; scoreCp: number; depth: number; principalVariation: string; engine: string };

export function parseEngineInfo(line: string) {
  const depth = Number(line.match(/\bdepth\s+(\d+)/)?.[1] ?? 0);
  const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
  const scoreCp = scoreMatch ? (scoreMatch[1] === "mate" ? Math.sign(Number(scoreMatch[2])) * 10_000 : Number(scoreMatch[2])) : 0;
  const principalVariation = line.match(/\bpv\s+(.+)$/)?.[1] ?? "";
  return { depth, scoreCp, principalVariation };
}

export async function analyzeWithChessEngine(fen: string, requestedDepth: number): Promise<EngineAnalysis> {
  new Chess(fen);
  const depth = Math.max(1, Math.min(8, Math.floor(requestedDepth)));
  const enginePath = process.env.CHESSIQ_ENGINE_PATH ?? path.resolve(process.cwd(), "engine/bin/ChessEngine");
  if (!fs.existsSync(enginePath)) throw new Error("ChessEngine binary is unavailable. Build the full-stack runtime before requesting analysis.");

  return new Promise((resolve, reject) => {
    const process = spawn(enginePath, [], { stdio: ["pipe", "pipe", "pipe"] });
    let latest = { depth: 0, scoreCp: 0, principalVariation: "" };
    let settled = false;
    const finish = (error?: Error, result?: EngineAnalysis) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      process.kill();
      if (error) reject(error); else if (result) resolve(result);
    };
    const timeout = setTimeout(() => finish(new Error("ChessEngine analysis timed out")), 12_000);
    process.stderr.on("data", chunk => { if (String(chunk).trim()) finish(new Error(`ChessEngine error: ${String(chunk).trim()}`)); });
    process.on("error", error => finish(error));
    process.stdout.on("data", chunk => {
      for (const line of String(chunk).split(/\r?\n/)) {
        if (line.startsWith("info ")) latest = { ...latest, ...parseEngineInfo(line) };
        if (line.startsWith("bestmove ")) {
          const bestMove = line.split(/\s+/)[1] ?? "";
          if (!bestMove || bestMove === "0000") return finish(new Error("ChessEngine did not find a legal move"));
          finish(undefined, { bestMove, scoreCp: latest.scoreCp, depth: latest.depth || depth, principalVariation: latest.principalVariation, engine: "ChessEngine 0.3" });
        }
      }
    });
    process.stdin.write(`uci\nisready\nposition fen ${fen}\ngo depth ${depth}\n`);
  });
}

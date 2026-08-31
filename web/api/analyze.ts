import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { normalizeDepth, parseUciInfo } from "../shared/engineProtocol";

const SMOKE_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type AnalysisResult = {
  bestMove: string;
  scoreCp: number;
  depth: number;
  principalVariation: string;
  engine: string;
};

function isSafeFen(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const fen = value.trim();
  if (!fen || fen.length > 180 || /[\r\n]/.test(fen)) return false;
  return fen.split(/\s+/).length === 6;
}

async function analyze(fen: string, requestedDepth: number): Promise<AnalysisResult> {
  const depth = normalizeDepth(requestedDepth);
  const enginePath = path.join(process.cwd(), "api", "bin", "ChessEngine");
  if (!fs.existsSync(enginePath)) {
    throw new Error("ChessEngine binary is unavailable in this deployment");
  }

  return new Promise((resolve, reject) => {
    const engineProcess = spawn(enginePath, [], { stdio: ["pipe", "pipe", "pipe"] });
    let latest = { depth: 0, scoreCp: 0, principalVariation: "" };
    let stdoutBuffer = "";
    let stderr = "";
    let settled = false;

    const finish = (error?: Error, result?: AnalysisResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      engineProcess.kill();
      if (error) reject(error);
      else if (result) resolve(result);
    };

    const handleLine = (line: string) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("info ")) latest = { ...latest, ...parseUciInfo(trimmed) };
      if (trimmed.startsWith("bestmove ")) {
        const bestMove = trimmed.split(/\s+/)[1] ?? "";
        if (!bestMove || bestMove === "0000") {
          finish(new Error("ChessEngine did not find a legal move"));
          return;
        }
        finish(undefined, {
          bestMove,
          scoreCp: latest.scoreCp,
          depth: latest.depth || depth,
          principalVariation: latest.principalVariation,
          engine: "ChessEngine 0.3",
        });
      }
    };

    const timeout = setTimeout(() => finish(new Error("ChessEngine analysis timed out")), 12_000);
    engineProcess.on("error", error => finish(error));
    engineProcess.stderr.on("data", chunk => { stderr += String(chunk); });
    engineProcess.on("exit", code => {
      if (!settled && code !== 0) finish(new Error(stderr.trim() || `ChessEngine exited with code ${code}`));
    });
    engineProcess.stdout.on("data", chunk => {
      stdoutBuffer += String(chunk);
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
    });

    engineProcess.stdin.write(`uci\nisready\nposition fen ${fen.trim()}\ngo depth ${depth}\n`);
  });
}

export default async function handler(request: any, response: any) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "GET") {
    const smoke = Array.isArray(request.query?.smoke) ? request.query.smoke[0] : request.query?.smoke;
    if (smoke !== "1") {
      response.setHeader("Allow", "POST");
      return response.status(405).json({ error: "Use POST for position analysis" });
    }

    try {
      const result = await analyze(SMOKE_FEN, 1);
      return response.status(200).json({ ...result, smoke: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "ChessEngine smoke test failed";
      return response.status(500).json({ error: message, smoke: true });
    }
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const body = request.body ?? {};
  if (!isSafeFen(body.fen)) return response.status(400).json({ error: "A valid single-line FEN is required" });

  try {
    const result = await analyze(body.fen, Number(body.depth ?? 4));
    return response.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ChessEngine analysis failed";
    return response.status(500).json({ error: message });
  }
}

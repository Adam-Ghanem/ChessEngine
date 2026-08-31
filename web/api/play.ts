import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type PlayResult = {
  fen: string;
  legalMoves: string[];
  engine: string;
};

function isSafeFen(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const fen = value.trim();
  if (!fen || fen.length > 180 || /[\r\n]/.test(fen)) return false;
  return fen.split(/\s+/).length === 6;
}

function isSafeMove(value: unknown): value is string {
  return typeof value === "string" && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value);
}

async function queryEngine(fen: string, move?: string): Promise<PlayResult> {
  const enginePath = path.join(__dirname, "bin", "ChessEngine");
  if (!fs.existsSync(enginePath)) throw new Error("ChessEngine binary is unavailable in this deployment");

  return new Promise((resolve, reject) => {
    const engineProcess = spawn(enginePath, [], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (error?: Error, result?: PlayResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      engineProcess.kill();
      if (error) reject(error);
      else if (result) resolve(result);
    };

    const timeout = setTimeout(() => finish(new Error("ChessEngine play request timed out")), 8_000);
    engineProcess.on("error", error => finish(error));
    engineProcess.stdout.on("data", chunk => { stdout += String(chunk); });
    engineProcess.stderr.on("data", chunk => { stderr += String(chunk); });
    engineProcess.on("close", code => {
      if (settled) return;
      if (code !== 0) return finish(new Error(stderr.trim() || `ChessEngine exited with code ${code}`));
      if (/^illegalmove\b/m.test(stdout)) return finish(new Error("ChessEngine rejected that move"));
      const playedFen = stdout.match(/^playok\s+(.+)$/m)?.[1]?.trim();
      const legalLine = [...stdout.matchAll(/^legalmoves(?:\s+(.*))?$/gm)].at(-1)?.[1]?.trim() ?? "";
      finish(undefined, {
        fen: playedFen || fen,
        legalMoves: legalLine ? legalLine.split(/\s+/).filter(Boolean) : [],
        engine: "ChessEngine 0.3",
      });
    });

    const commands = [`position fen ${fen.trim()}`];
    if (move) commands.push(`play ${move}`);
    commands.push("legalmoves", "quit");
    engineProcess.stdin.end(`${commands.join("\n")}\n`);
  });
}

export default async function handler(request: any, response: any) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const body = request.body ?? {};
  const fen = body.fen ?? START_FEN;
  if (!isSafeFen(fen)) return response.status(400).json({ error: "A valid single-line FEN is required" });
  if (body.move != null && !isSafeMove(body.move)) return response.status(400).json({ error: "Move must use UCI notation" });

  try {
    return response.status(200).json(await queryEngine(fen, body.move));
  } catch (error) {
    const message = error instanceof Error ? error.message : "ChessEngine play request failed";
    const status = message.includes("rejected") ? 400 : 500;
    return response.status(status).json({ error: message });
  }
}

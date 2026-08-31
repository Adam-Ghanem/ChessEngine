import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production Play workspace", () => {
  it("routes Play through the production web shell instead of a placeholder", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
    expect(app).toContain('path="/play"');
    expect(app).toContain('from "./pages/Play"');
    expect(play).toContain('ProductHeader activePath="/play"');
    expect(play).not.toContain("Play workspace is coming next.");
  });

  it("uses the first-party ChessEngine as the legal-move authority", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
    const client = readFileSync(new URL("./engine/playEngine.ts", import.meta.url), "utf8");
    const api = readFileSync(new URL("../../api/play.ts", import.meta.url), "utf8");
    const engine = readFileSync(new URL("../../../app/engine/src/main.cpp", import.meta.url), "utf8");
    expect(play).toContain("fetchLegalMoves");
    expect(play).toContain("playMove");
    expect(client).toContain('fetch("/api/play"');
    expect(api).toContain('path.join(__dirname, "bin", "ChessEngine")');
    expect(engine).toContain('command == "legalmoves"');
    expect(engine).toContain('command == "play"');
  });

  it("gets check, mate, stalemate, and draw status from ChessEngine", () => {
    const client = readFileSync(new URL("./engine/playEngine.ts", import.meta.url), "utf8");
    const api = readFileSync(new URL("../../api/play.ts", import.meta.url), "utf8");
    const engine = readFileSync(new URL("../../../app/engine/src/main.cpp", import.meta.url), "utf8");
    expect(client).toContain('status: "ongoing" | "check" | "checkmate" | "stalemate" | "draw"');
    expect(api).toContain('commands.push("legalmoves", "status", "quit")');
    expect(api).toContain("statusMatch");
    expect(engine).toContain('command == "status"');
  });

  it("lets the user play White against the first-party ChessEngine", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
    expect(play).toContain("analyzePosition");
    expect(play).toContain('type PlayMode = "local" | "computer"');
    expect(play).toContain("Play ChessIQ");
    expect(play).toContain("ChessIQ is thinking");
    expect(play).toContain("applyComputerReply");
    expect(play).not.toContain("Stockfish");
  });

  it("exposes a production runtime smoke check for packaged legal moves", () => {
    const api = readFileSync(new URL("../../api/play.ts", import.meta.url), "utf8");
    expect(api).toContain('request.method === "GET"');
    expect(api).toContain('smoke !== "1"');
    expect(api).toContain('smoke: true');
  });
});

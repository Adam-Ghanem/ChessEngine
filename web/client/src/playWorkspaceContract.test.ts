import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production Play workspace", () => {
  it("routes Play through the production web shell instead of a placeholder", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
    expect(app).toContain('path="/play"');
    expect(app).toContain('from "./pages/Play"');
    expect(home).toContain('href="/play"');
    expect(home).not.toContain("Play workspace is coming next.");
  });

  it("uses the first-party ChessEngine as the legal-move authority", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
    const client = readFileSync(new URL("./engine/playEngine.ts", import.meta.url), "utf8");
    const api = readFileSync(new URL("../../../api/play.ts", import.meta.url), "utf8");
    const engine = readFileSync(new URL("../../../../app/engine/src/main.cpp", import.meta.url), "utf8");
    expect(play).toContain("fetchLegalMoves");
    expect(play).toContain("playMove");
    expect(client).toContain('fetch("/api/play"');
    expect(api).toContain('path.join(__dirname, "bin", "ChessEngine")');
    expect(engine).toContain('command == "legalmoves"');
    expect(engine).toContain('command == "play"');
  });
});

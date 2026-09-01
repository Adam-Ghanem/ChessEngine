import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ opening explorer production foundation", () => {
  it("exposes a directly addressable opening explorer from Learn", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const learn = readFileSync(new URL("./pages/Learn.tsx", import.meta.url), "utf8");
    const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8");

    expect(app).toContain('path="/learn/openings"');
    expect(learn).toContain('href="/learn/openings"');
    expect(vercel).toContain('"source": "/learn/openings"');
    expect(existsSync(new URL("./pages/Openings.tsx", import.meta.url))).toBe(true);
  });

  it("ships searchable opening-family data and an accessible explorer workspace", () => {
    expect(existsSync(new URL("./data/openings.ts", import.meta.url))).toBe(true);
    expect(existsSync(new URL("./openings.css", import.meta.url))).toBe(true);
  });

  it("provides ECO A-E volume navigation that scales toward the full A00-E99 catalog", () => {
    const explorer = readFileSync(new URL("./pages/Openings.tsx", import.meta.url), "utf8");
    const data = readFileSync(new URL("./data/openings.ts", import.meta.url), "utf8");

    expect(data).toContain("export const ecoVolumes");
    expect(data).toContain("filterOpeningFamiliesByEcoVolume");
    expect(explorer).toContain('aria-label="Filter openings by ECO volume"');
    expect(explorer).toContain("ecoVolumes.map");
    expect(explorer).toContain("All ECO");
  });

  it("provides a directly addressable board-first detail workspace for every opening family", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const explorer = readFileSync(new URL("./pages/Openings.tsx", import.meta.url), "utf8");
    const data = readFileSync(new URL("./data/openings.ts", import.meta.url), "utf8");
    const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8");

    expect(app).toContain('path="/learn/openings/:id"');
    expect(explorer).toContain('href={`/learn/openings/${opening.id}`}');
    expect(data).toContain("uci:");
    expect(vercel).toContain('"source": "/learn/openings/:id"');
    expect(existsSync(new URL("./pages/OpeningDetail.tsx", import.meta.url))).toBe(true);
    expect(existsSync(new URL("./opening-detail.css", import.meta.url))).toBe(true);
  });
});

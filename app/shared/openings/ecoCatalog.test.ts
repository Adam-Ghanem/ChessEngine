import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { ECO_CATALOG, getOpeningBySlug, getOpeningsByEco } from "./ecoCatalog";
import { searchOpenings } from "./search";
import { validateOpeningCatalog } from "./validation";

function allEcoCodes() {
  const codes: string[] = [];
  for (const volume of ["A", "B", "C", "D", "E"] as const) {
    for (let n = 0; n < 100; n++) codes.push(`${volume}${String(n).padStart(2, "0")}`);
  }
  return codes;
}

describe("canonical ECO opening catalog", () => {
  it("covers every ECO code from A00 through E99", () => {
    const covered = new Set(ECO_CATALOG.map(node => node.eco));
    for (const code of allEcoCodes()) expect(covered.has(code), `${code} missing`).toBe(true);
  });

  it("passes structural and legal-move validation", () => {
    expect(validateOpeningCatalog(ECO_CATALOG)).toEqual([]);
  });

  it("replays representative catalog lines legally", () => {
    for (const slug of ["sicilian-defense", "ruy-lopez", "queens-gambit", "kings-indian-defense", "english-opening"]) {
      const node = getOpeningBySlug(slug);
      expect(node, slug).toBeTruthy();
      const chess = new Chess();
      for (const uci of node!.uci) {
        const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as "q" | "r" | "b" | "n" | undefined });
        expect(move, `${slug}: illegal ${uci}`).toBeTruthy();
      }
    }
  });

  it("searches names, ECO codes, aliases, and move sequences", () => {
    expect(searchOpenings("Najdorf")[0]?.name).toMatch(/Najdorf/i);
    expect(searchOpenings("C60").some(node => node.eco === "C60")).toBe(true);
    expect(searchOpenings("Spanish").some(node => /Ruy Lopez/i.test(node.name))).toBe(true);
    expect(searchOpenings("e4 e5 Nf3 Nc6 Bb5").some(node => /Ruy Lopez/i.test(node.name))).toBe(true);
    expect(searchOpenings("e2e4 c7c5").some(node => /Sicilian/i.test(node.name))).toBe(true);
  });

  it("resolves opening details and ECO groups deterministically", () => {
    expect(getOpeningBySlug("caro-kann-defense")?.eco).toMatch(/^B1/);
    expect(getOpeningsByEco("B20").every(node => node.eco === "B20")).toBe(true);
  });
});

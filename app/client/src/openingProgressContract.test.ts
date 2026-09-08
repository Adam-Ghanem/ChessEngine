import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("opening progress integration", () => {
  it("renders the opening mastery section from Progress", () => {
    const page = readFileSync(new URL("./pages/ProgressPage.tsx", import.meta.url), "utf8");
    expect(page).toContain('import { OpeningProgressSection } from "@/components/openings/OpeningProgressSection"');
    expect(page).toContain("<OpeningProgressSection");
  });

  it("shows repertoire, due review, weakest branch, mastery, and continuation surfaces", () => {
    const source = readFileSync(new URL("./components/openings/OpeningProgressSection.tsx", import.meta.url), "utf8");
    expect(source).toContain("White repertoire");
    expect(source).toContain("Black repertoire");
    expect(source).toContain("Due reviews");
    expect(source).toContain("Weakest branches");
    expect(source).toContain("mastery");
    expect(source).toContain("Continue training");
    expect(source).toContain('/trainer?mode=mixed');
  });
});

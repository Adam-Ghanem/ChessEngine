import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play move list follow contract", () => {
  it("keeps the newest move visible without scrolling the page", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

    expect(play).toContain("const moveListRef = useRef<HTMLDivElement>(null)");
    expect(play).toContain('ref={moveListRef} className="play-move-list"');
    expect(play).toMatch(/useEffect\(\(\) => \{[\s\S]*moveListRef\.current[\s\S]*moves\.length[\s\S]*scrollTo\(\{[\s\S]*top: moveList\.scrollHeight/);
    expect(play).toContain('(prefers-reduced-motion: reduce)');
    expect(play).toContain('behavior: reduceMotion ? "auto" : "smooth"');
  });
});

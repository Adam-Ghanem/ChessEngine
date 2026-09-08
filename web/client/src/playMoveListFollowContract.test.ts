import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play move list follow contract", () => {
  it("keeps the newest move visible inside the move list without scrolling the page", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const followModuleUrl = new URL("./playMoveListFollow.ts", import.meta.url);

    expect(main).toContain('import "./playMoveListFollow";');
    expect(existsSync(followModuleUrl)).toBe(true);
    if (!existsSync(followModuleUrl)) return;

    const followModule = readFileSync(followModuleUrl, "utf8");
    expect(followModule).toContain('document.querySelector<HTMLElement>(".play-move-list")');
    expect(followModule).toContain('list.querySelectorAll(".play-move-row").length');
    expect(followModule).toContain("new MutationObserver");
    expect(followModule).toContain("list.scrollTo({");
    expect(followModule).toContain("top: list.scrollHeight");
    expect(followModule).toContain('(prefers-reduced-motion: reduce)');
    expect(followModule).toContain('behavior: reduceMotion ? "auto" : "smooth"');
    expect(followModule).not.toContain("scrollIntoView");
  });
});

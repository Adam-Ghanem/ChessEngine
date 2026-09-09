import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ route focus accessibility", () => {
  it("moves SPA route focus to the new page heading before falling back to the shared skip target", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

    expect(app).toContain('document.querySelector<HTMLElement>("main h1")');
    expect(app).toContain("heading.tabIndex = -1");
    expect(app).toContain("heading.focus()");
    expect(app).toContain('document.getElementById("main-content")');
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("route focus management integration", () => {
  it("moves keyboard focus to the new ChessIQ workspace after SPA navigation", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(appSource).toContain("function RouteFocusManagement()");
    expect(appSource).toContain('document.getElementById("main-content")');
    expect(appSource).toContain("target.focus()");
    expect(appSource).toContain("MutationObserver");
    expect(appSource).toContain("previousLocationRef");
  });
});

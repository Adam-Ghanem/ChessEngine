import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("route document title integration", () => {
  it("updates the production shell title from the active Wouter location", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(appSource).toContain("useLocation");
    expect(appSource).toContain("documentTitleForPath(location)");
    expect(appSource).toContain("document.title =");
    expect(appSource).toContain("<RouteDocumentTitle />");
  });
});

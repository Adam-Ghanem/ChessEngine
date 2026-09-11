import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("route live announcement integration", () => {
  it("announces SPA navigation without claiming lazy content has already loaded", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(appSource).toContain('aria-live="polite"');
    expect(appSource).toContain('aria-atomic="true"');
    expect(appSource).toContain('role="status"');
    expect(appSource).toContain('setAnnouncement(`Navigated to ${documentTitleForPath(location)}`)');
    expect(appSource).not.toContain('setAnnouncement(`${documentTitleForPath(location)} loaded`)');
  });
});

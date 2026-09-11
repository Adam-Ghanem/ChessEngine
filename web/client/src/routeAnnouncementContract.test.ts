import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("route announcement contract", () => {
  it("does not announce a lazy route as loaded before the route content has rendered", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

    expect(app).toContain('setAnnouncement(`Navigated to ${documentTitleForPath(location)}`)');
    expect(app).not.toContain('setAnnouncement(`${documentTitleForPath(location)} loaded`)');
  });
});

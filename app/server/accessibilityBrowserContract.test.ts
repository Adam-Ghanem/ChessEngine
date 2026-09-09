import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("accessibility browser launcher", () => {
  it("uses the GitHub runner Google Chrome binary instead of the unreliable Chromium wrapper", () => {
    const script = readFileSync(new URL("../scripts/verify-accessibility.mjs", import.meta.url), "utf8");

    expect(script).toContain('executablePath: process.env.CHROME_BIN ?? "/usr/bin/google-chrome"');
    expect(script).not.toContain('executablePath: "/usr/bin/chromium"');
  });
});

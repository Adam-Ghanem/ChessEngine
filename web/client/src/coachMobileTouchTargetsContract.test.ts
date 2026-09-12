import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("./coach.css", import.meta.url), "utf8");

describe("Coach mobile touch target contract", () => {
  it("keeps Coach training and follow-up links at least 44px tall", () => {
    expect(styles).toMatch(/\.coach-plan-step > a \{[^}]*min-height: 44px;/);
    expect(styles).toMatch(/\.coach-links a \{[^}]*min-height: 44px;/);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("move classification accessibility", () => {
  it("exposes the full classification label and description even for compact badges", () => {
    const badge = readFileSync(new URL("./components/ClassificationBadge.tsx", import.meta.url), "utf8");

    expect(badge).toContain('className="sr-only"');
    expect(badge).toContain("meta.description");
    expect(badge).toContain("meta.label");
    expect(badge).toContain('aria-hidden={compact ? true : undefined}');
  });
});

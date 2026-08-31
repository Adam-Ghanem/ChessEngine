import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production mobile analysis layout", () => {
  it("keeps the production workspace readable in compact viewports", () => {
    const css = readFileSync(new URL("./index.css", import.meta.url), "utf8");
    const reviewCss = readFileSync(new URL("./game-review.css", import.meta.url), "utf8");

    expect(css).toContain("@media (max-width:1030px)");
    expect(css).toContain("grid-template-areas:\"primary\" \"rail\" \"graph\"");
    expect(css).toContain(".app-header { flex-wrap:wrap;");
    expect(css).toContain(".app-nav { order:3;");
    expect(css).toContain("overflow-x:auto");
    expect(reviewCss).toContain("@media (max-width:1030px)");
    expect(reviewCss).toContain(".game-review-card { position:relative;");
  });
});

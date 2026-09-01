import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ premium application shell", () => {
  it("uses a dedicated premium shell stylesheet and desktop sidebar navigation", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(main).toContain('import "./premium-shell.css"');
    expect(header).toContain("product-sidebar");
    expect(header).toContain("sidebar-nav-icon");
  });

  it("turns the root route into a real product dashboard without replacing Play", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

    expect(app).toContain('import Dashboard from "./pages/Dashboard"');
    expect(app).toContain('<Route path="/" component={Dashboard} />');
    expect(app).toContain('<Route path="/play" component={Play} />');
  });

  it("keeps the desktop sidebar responsive instead of forcing it onto mobile", () => {
    const css = readFileSync(new URL("./premium-shell.css", import.meta.url), "utf8");

    expect(css).toContain("@media (max-width: 900px)");
    expect(css).toContain(".product-sidebar");
    expect(css).toContain("--premium-gold");
  });
});

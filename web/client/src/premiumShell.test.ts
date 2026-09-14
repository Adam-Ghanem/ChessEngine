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

  it("keeps the root route as the real product dashboard while allowing it to be route-split", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const loaders = readFileSync(new URL("./lib/productRouteLoaders.ts", import.meta.url), "utf8");

    expect(app).toContain('const Dashboard = lazy(productRouteLoaders["/"])');
    expect(loaders).toContain('"/": () => import("../pages/Dashboard")');
    expect(app).toContain('<Route path="/" component={Dashboard} />');
    expect(app).toContain('<Route path="/play" component={Play} />');
  });

  it("keeps the desktop sidebar responsive instead of forcing it onto mobile", () => {
    const css = readFileSync(new URL("./premium-shell.css", import.meta.url), "utf8");

    expect(css).toContain("@media (max-width: 900px)");
    expect(css).toContain(".product-sidebar");
    expect(css).toContain("--premium-gold");
  });

  it("groups the desktop navigation into clear product workflows without changing route ownership", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./premium-shell.css", import.meta.url), "utf8");

    expect(header).toContain("const desktopNavSections");
    expect(header).toContain('label: "Play"');
    expect(header).toContain('label: "Improve"');
    expect(header).toContain('label: "Review"');
    expect(header).toContain('className="premium-nav-group"');
    expect(header).toContain('className="premium-nav-group-label"');
    expect(css).toContain(".premium-nav-group-label");
    expect(css).toContain(".premium-nav-group");
  });
});

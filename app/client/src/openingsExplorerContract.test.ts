import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productNavigation";

describe("Openings Explorer product surface", () => {
  it("registers first-class explorer, detail, and trainer routes", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    expect(app).toContain('import OpeningsPage from "./pages/OpeningsPage"');
    expect(app).toContain('import OpeningDetailPage from "./pages/OpeningDetailPage"');
    expect(app).toContain('import OpeningTrainerPage from "./pages/OpeningTrainerPage"');
    expect(app).toContain('<Route path="/openings" component={OpeningsPage} />');
    expect(app).toContain('<Route path="/openings/:slug" component={OpeningDetailPage} />');
    expect(app).toContain('<Route path="/trainer" component={OpeningTrainerPage} />');
  });

  it("promotes Openings into the primary product navigation", () => {
    expect(productRoutes.some(route => route.href === "/openings" && route.label === "Openings")).toBe(true);
  });

  it("keeps a direct Train this line action on opening detail", () => {
    const detail = readFileSync(new URL("./pages/OpeningDetailPage.tsx", import.meta.url), "utf8");
    expect(detail).toContain("Train this line");
    expect(detail).toContain("opening-train-cta");
  });

  it("defines a three-column desktop workspace that collapses board-first on mobile", () => {
    const css = readFileSync(new URL("./openings-premium.css", import.meta.url), "utf8");
    expect(css).toContain(".openings-workspace");
    expect(css).toMatch(/grid-template-columns:\s*minmax\([^;]+\)\s+minmax\([^;]+\)\s+minmax\([^;]+\)/);
    expect(css).toContain("@media (max-width: 860px)");
    expect(css).toContain("grid-template-columns: 1fr");
    expect(css).toContain(".opening-mobile-train-dock");
  });

  it("loads the premium openings stylesheet from the application entry point", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    expect(main).toContain('import "./openings-premium.css"');
  });
});

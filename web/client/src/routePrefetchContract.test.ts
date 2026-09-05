import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
const loaders = readFileSync(new URL("./lib/productRouteLoaders.ts", import.meta.url), "utf8");

describe("production route prefetch contract", () => {
  it("route-splits every product page, including Dashboard, behind shared lazy loaders", () => {
    expect(app).toContain('import { productRouteLoaders } from "./lib/productRouteLoaders"');
    expect(app).not.toContain('import Dashboard from "./pages/Dashboard"');
    expect(app).toContain('lazy(productRouteLoaders["/"]');
    expect(app).toContain('lazy(productRouteLoaders["/play"]');
    expect(app).toContain('lazy(productRouteLoaders["/analyze"]');
    expect(loaders).toContain('"/": () => import("../pages/Dashboard")');
    expect(loaders).toContain('"/play": () => import("../pages/Play")');
    expect(loaders).toContain('"/puzzles": () => import("../pages/Puzzles")');
    expect(loaders).toContain('"/learn": () => import("../pages/Learn")');
    expect(loaders).toContain('"/games": () => import("../pages/Games")');
    expect(loaders).toContain('"/analyze": () => import("../pages/Analyze")');
    expect(loaders).toContain('"/coach": () => import("../pages/Coach")');
    expect(loaders).toContain('"/progress": () => import("../pages/Progress")');
  });

  it("prefetches non-Home product routes only after pointer, keyboard, or touch intent", () => {
    expect(header).toContain("onPointerEnter: () => prefetchProductRoute(href)");
    expect(header).toContain("onFocus: () => prefetchProductRoute(href)");
    expect(header).toContain("onTouchStart: () => prefetchProductRoute(href)");
    expect(header).toContain("{...routeIntentProps(href)}");
    expect(loaders).toContain('if (path === "/" || prefetchedRoutes.has(path)) return;');
    expect(loaders).toContain("prefetchedRoutes.delete(path)");
  });
});

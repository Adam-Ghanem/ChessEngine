import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production app shell performance contract", () => {
  it("keeps unused tooltip infrastructure out of the eager shell", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

    expect(app).not.toContain('import { TooltipProvider } from "@/components/ui/tooltip"');
    expect(app).not.toContain("<TooltipProvider>");
    expect(app).toContain('import { Toaster } from "@/components/ui/sonner"');
    expect(app).toContain("const Analyze = lazy(productRouteLoaders[\"/analyze\"]);");
    expect(app).toContain("const Play = lazy(productRouteLoaders[\"/play\"]);");
  });
});

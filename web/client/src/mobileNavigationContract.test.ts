import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ mobile premium navigation", () => {
  it("keeps desktop navigation while exposing a dedicated mobile bottom dock", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./mobile-navigation.css", import.meta.url), "utf8");

    expect(header).toContain('aria-label="Mobile navigation"');
    expect(header).toContain("mobile-bottom-nav");
    expect(header).toContain("mobile-more-button");
    expect(main).toContain('import "./mobile-navigation.css"');
    expect(existsSync(new URL("./mobile-navigation.css", import.meta.url))).toBe(true);
    expect(css).toContain("env(safe-area-inset-bottom)");
    expect(css).toContain(".mobile-bottom-nav");
    expect(css).toContain("@media (max-width: 640px)");
  });

  it("gives Play, Puzzles and Analyze first-class mobile destinations", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain('const mobilePrimaryRoutes: ProductPath[] = ["/", "/play", "/puzzles", "/analyze"]');
    expect(header).toContain('aria-current={isActive ? "page" : undefined}');
    expect(header).toContain('const mobileMoreRoutes: ProductPath[] = ["/learn", "/learn/openings", "/games", "/coach", "/progress"]');
  });

  it("keeps the mobile More menu dismissible and route-aware", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain("const mobileMoreRef = useRef<HTMLDetailsElement>(null)");
    expect(header).toContain('event.key !== "Escape"');
    expect(header).toContain("mobileMoreRef.current.open = false");
    expect(header).toContain("mobileMoreRef.current?.contains(event.target as Node)");
    expect(header).toContain("onClick={closeMobileMore}");
  });

  it("moves focus into the mobile More menu when it opens", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain("function handleMobileMoreToggle()");
    expect(header).toContain("if (!mobileMoreRef.current?.open) return");
    expect(header).toContain('.querySelector<HTMLAnchorElement>(".mobile-more-link.is-active, .mobile-more-link")');
    expect(header).toContain("requestAnimationFrame");
    expect(header).toContain("onToggle={handleMobileMoreToggle}");
  });

  it("closes the mobile More menu when keyboard focus leaves the popover", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain("function handleFocusIn(event: FocusEvent)");
    expect(header).toContain("if (mobileMoreRef.current?.contains(event.target as Node)) return");
    expect(header).toContain('document.addEventListener("focusin", handleFocusIn)');
    expect(header).toContain('document.removeEventListener("focusin", handleFocusIn)');
  });

  it("surfaces the current secondary section directly in the mobile dock", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain("const activeMoreRoute = productRoutes.find");
    expect(header).toContain("const MobileMoreIcon = activeMoreRoute ? routeIcons[activeMoreRoute.href] : Menu");
    expect(header).toContain("<MobileMoreIcon size={19} aria-hidden=\"true\" />");
    expect(header).toContain("<span>{activeMoreRoute?.label ?? \"More\"}</span>");
    expect(header).toContain('aria-label={activeMoreRoute ? `${activeMoreRoute.label}, open more ChessIQ sections` : "Open more ChessIQ sections"}');
  });

  it("keeps current-page semantics on the actual More-menu destination", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const summaryStart = header.indexOf('<summary\n            className="mobile-more-button"');
    const summaryEnd = header.indexOf("</summary>", summaryStart);
    const summaryMarkup = header.slice(summaryStart, summaryEnd);

    expect(summaryStart).toBeGreaterThan(-1);
    expect(summaryMarkup).not.toContain("aria-current");
    expect(header).toContain('className={`mobile-more-link ${isActive ? "is-active" : ""}`}');
    expect(header).toContain('aria-current={isActive ? "page" : undefined}');
  });

  it("keeps mobile theme control at an accessible touch target size", () => {
    const css = readFileSync(new URL("./mobile-navigation.css", import.meta.url), "utf8");

    expect(css).toContain(".premium-sidebar-actions .theme-toggle");
    expect(css).toContain("min-width: 44px");
    expect(css).toContain("min-height: 44px");
  });

  it("keeps the mobile More menu usable in short landscape viewports", () => {
    const css = readFileSync(new URL("./mobile-navigation.css", import.meta.url), "utf8");

    expect(css).toContain("max-height: calc(100dvh - 108px - env(safe-area-inset-bottom))");
    expect(css).toContain("overflow-y: auto");
    expect(css).toContain("overscroll-behavior: contain");
  });
});

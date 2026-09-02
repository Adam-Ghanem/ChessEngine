import { useEffect, useRef } from "react";
import { BarChart3, BookOpen, Bot, Gamepad2, Home, LibraryBig, Menu, Moon, Puzzle, Search, Sun } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/contexts/ThemeContext";
import { productRoutes, type ProductPath } from "@/lib/productRoutes";

type ProductHeaderProps = {
  activePath: ProductPath;
};

const routeIcons: Record<ProductPath, typeof Home> = {
  "/": Home,
  "/play": Gamepad2,
  "/puzzles": Puzzle,
  "/learn": BookOpen,
  "/games": LibraryBig,
  "/analyze": Search,
  "/coach": Bot,
  "/progress": BarChart3,
};

const mobilePrimaryRoutes: ProductPath[] = ["/", "/play", "/puzzles", "/analyze"];
const mobileMoreRoutes: ProductPath[] = ["/learn", "/games", "/coach", "/progress"];

export function ProductHeader({ activePath }: ProductHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const moreIsActive = mobileMoreRoutes.includes(activePath);

  useEffect(() => {
    const nav = navRef.current;
    const activeLink = activeLinkRef.current;
    if (!nav || !activeLink || nav.scrollWidth <= nav.clientWidth) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    activeLink.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activePath]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="app-header product-header product-sidebar">
        <Link href="/" className="brand-link premium-brand-link" aria-label="Open ChessIQ Home">
          <BrandMark />
        </Link>
        <nav ref={navRef} className="app-nav premium-sidebar-nav" aria-label="Primary navigation">
          {productRoutes.map(({ href, label }) => {
            const isActive = activePath === href;
            const Icon = routeIcons[href];
            return (
              <Link
                key={href}
                ref={isActive ? activeLinkRef : undefined}
                className={`nav-item premium-nav-item ${isActive ? "is-active" : ""}`}
                href={href}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="sidebar-nav-icon" aria-hidden="true"><Icon size={18} /></span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="premium-sidebar-meta" aria-label="ChessIQ product status">
          <span className="premium-badge">Premium workspace</span>
          <small>First-party ChessEngine</small>
        </div>
        <div className="header-actions premium-sidebar-actions">
          <button
            className="theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobilePrimaryRoutes.map((href) => {
          const route = productRoutes.find((candidate) => candidate.href === href)!;
          const Icon = routeIcons[href];
          const isActive = activePath === href;
          return (
            <Link
              key={href}
              href={href}
              className={`mobile-bottom-link ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{route.label}</span>
            </Link>
          );
        })}
        <details className={`mobile-more ${moreIsActive ? "is-active" : ""}`}>
          <summary className="mobile-more-button" aria-label="Open more ChessIQ sections">
            <Menu size={19} aria-hidden="true" />
            <span>More</span>
          </summary>
          <div className="mobile-more-menu">
            {mobileMoreRoutes.map((href) => {
              const route = productRoutes.find((candidate) => candidate.href === href)!;
              const Icon = routeIcons[href];
              const isActive = activePath === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`mobile-more-link ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{route.label}</span>
                </Link>
              );
            })}
          </div>
        </details>
      </nav>

      <span id="main-content" className="skip-target" tabIndex={-1} />
    </>
  );
}

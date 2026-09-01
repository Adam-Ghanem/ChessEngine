import { useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/contexts/ThemeContext";
import { productRoutes, type ProductPath } from "@/lib/productRoutes";

type ProductHeaderProps = {
  activePath: ProductPath;
};

export function ProductHeader({ activePath }: ProductHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

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
      <header className="app-header product-header">
        <Link href="/play" className="brand-link" aria-label="Open ChessIQ Play">
          <BrandMark />
        </Link>
        <nav ref={navRef} className="app-nav" aria-label="Primary navigation">
          {productRoutes.map(({ href, label }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={href}
                ref={isActive ? activeLinkRef : undefined}
                className={`nav-item ${isActive ? "is-active" : ""}`}
                href={href}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
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
      <span id="main-content" className="skip-target" tabIndex={-1} />
    </>
  );
}

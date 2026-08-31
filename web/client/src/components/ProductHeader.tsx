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

  return (
    <header className="app-header product-header">
      <Link href="/play" className="brand-link" aria-label="Open ChessIQ Play">
        <BrandMark />
      </Link>
      <nav className="app-nav" aria-label="Primary navigation">
        {productRoutes.map(({ href, label }) => (
          <Link
            key={href}
            className={`nav-item ${activePath === href ? "is-active" : ""}`}
            href={href}
            aria-current={activePath === href ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
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
  );
}

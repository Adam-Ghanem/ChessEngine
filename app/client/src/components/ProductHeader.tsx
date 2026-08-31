import { BrainCircuit, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { BrandMark } from "@/components/BrandMark";
import { productRoutes } from "@/lib/productNavigation";

export function ProductHeader() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <>
      <header className="app-header product-header">
        <Link href="/play" className="brand-link" aria-label="ChessIQ home">
          <BrandMark />
        </Link>

        <nav className="app-nav product-nav" aria-label="ChessIQ product navigation">
          {productRoutes.map(({ href, label }) => {
            const isActive = location === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`nav-item ${isActive ? "is-active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions product-actions">
          <button className="theme-toggle" aria-label="Toggle color theme" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          {loading ? (
            <span className="account-state">Syncing account</span>
          ) : isAuthenticated ? (
            <>
              <span className="account-state">
                <UserRound size={14} />
                {user?.name ?? "Member"}
              </span>
              <button className="account-button" onClick={() => logout()}>
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <button className="account-button account-primary" onClick={() => startLogin()}>
              <BrainCircuit size={14} />
              Sign in
            </button>
          )}
        </div>
      </header>

      <nav className="mobile-product-nav" aria-label="Mobile ChessIQ product navigation">
        {productRoutes.map(({ href, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`mobile-nav-item ${isActive ? "is-active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

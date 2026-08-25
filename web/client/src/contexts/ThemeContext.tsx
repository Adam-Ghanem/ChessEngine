/**
 * ChessIQ Intelligence in Motion: one persisted data-theme source shared by every public screen.
 */
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("chessiq-theme") as Theme) || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("chessiq-theme", theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark") }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

const PRODUCT_TITLES: Record<string, string> = {
  "/": "ChessIQ — Home",
  "/play": "ChessIQ — Play",
  "/puzzles": "ChessIQ — Puzzles",
  "/learn": "ChessIQ — Learn",
  "/games": "ChessIQ — Games",
  "/analyze": "ChessIQ — Analyze",
  "/review": "ChessIQ — Game Review",
  "/coach": "ChessIQ — Coach",
  "/progress": "ChessIQ — Progress",
  "/404": "ChessIQ — Page Not Found",
};

function normalizePath(location: string) {
  const path = location.split(/[?#]/, 1)[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function documentTitleForPath(location: string) {
  const path = normalizePath(location);

  if (path === "/learn/openings" || path.startsWith("/learn/openings/")) {
    return "ChessIQ — Openings";
  }

  return PRODUCT_TITLES[path] ?? "ChessIQ — Page Not Found";
}

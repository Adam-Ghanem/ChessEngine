export const productRoutes = [
  { href: "/play", label: "Play" },
  { href: "/games", label: "Games" },
  { href: "/analyze", label: "Analyze" },
  { href: "/learn", label: "Learn" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/progress", label: "Progress" },
] as const;

export type ProductPath = (typeof productRoutes)[number]["href"];

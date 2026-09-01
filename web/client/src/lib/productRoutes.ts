export const productRoutes = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/learn", label: "Learn" },
  { href: "/games", label: "Games" },
  { href: "/analyze", label: "Analyze" },
  { href: "/coach", label: "Coach" },
  { href: "/progress", label: "Progress" },
] as const;

export type ProductPath = (typeof productRoutes)[number]["href"];

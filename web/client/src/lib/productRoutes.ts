export const productRoutes = [
  { href: "/play", label: "Play" },
  { href: "/analyze", label: "Analyze" },
  { href: "/learn", label: "Learn" },
  { href: "/puzzles", label: "Puzzles" },
] as const;

export type ProductPath = (typeof productRoutes)[number]["href"];

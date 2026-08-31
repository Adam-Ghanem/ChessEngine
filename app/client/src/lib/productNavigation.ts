export type ProductRoute = {
  href: string;
  label: string;
};

export const productRoutes = [
  { href: "/play", label: "Play" },
  { href: "/analyze", label: "Analyze" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/learn", label: "Learn" },
  { href: "/games", label: "Games" },
  { href: "/progress", label: "Progress" },
  { href: "/coach", label: "Coach" },
] as const satisfies readonly ProductRoute[];

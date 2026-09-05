import type { ComponentType } from "react";
import type { ProductPath } from "./productRoutes";

type LazyPageModule = { default: ComponentType };

export const productRouteLoaders: Record<ProductPath, () => Promise<LazyPageModule>> = {
  "/": () => import("../pages/Dashboard"),
  "/play": () => import("../pages/Play"),
  "/puzzles": () => import("../pages/Puzzles"),
  "/learn": () => import("../pages/Learn"),
  "/games": () => import("../pages/Games"),
  "/analyze": () => import("../pages/Analyze"),
  "/coach": () => import("../pages/Coach"),
  "/progress": () => import("../pages/Progress"),
};

const prefetchedRoutes = new Set<ProductPath>();

export function prefetchProductRoute(path: ProductPath) {
  if (prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);

  void productRouteLoaders[path]().catch(() => {
    prefetchedRoutes.delete(path);
  });
}

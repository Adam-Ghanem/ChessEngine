/**
 * ChessIQ production web shell. Vercel currently builds from web/, so all live product routes originate here.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import { productRouteLoaders } from "./lib/productRouteLoaders";

const Analyze = lazy(productRouteLoaders["/analyze"] as () => Promise<{ default: React.ComponentType }>);
const Coach = lazy(productRouteLoaders["/coach"] as () => Promise<{ default: React.ComponentType }>);
const Games = lazy(productRouteLoaders["/games"] as () => Promise<{ default: React.ComponentType }>);
const Learn = lazy(productRouteLoaders["/learn"] as () => Promise<{ default: React.ComponentType }>);
const Play = lazy(productRouteLoaders["/play"] as () => Promise<{ default: React.ComponentType }>);
const Puzzles = lazy(productRouteLoaders["/puzzles"] as () => Promise<{ default: React.ComponentType }>);
const Progress = lazy(productRouteLoaders["/progress"] as () => Promise<{ default: React.ComponentType }>);
const OpeningDetail = lazy(() => import("./pages/OpeningDetail"));
const Openings = lazy(() => import("./pages/Openings"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted-foreground">Loading ChessIQ workspace…</p>
      </div>
    </main>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/play" component={Play} />
        <Route path="/games" component={Games} />
        <Route path="/analyze" component={Analyze} />
        <Route path="/review" component={Analyze} />
        <Route path="/learn/openings/:id" component={OpeningDetail} />
        <Route path="/learn/openings" component={Openings} />
        <Route path="/learn" component={Learn} />
        <Route path="/puzzles" component={Puzzles} />
        <Route path="/progress" component={Progress} />
        <Route path="/coach" component={Coach} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

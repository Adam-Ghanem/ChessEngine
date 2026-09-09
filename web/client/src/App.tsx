/**
 * ChessIQ production web shell. Vercel currently builds from web/, so all live product routes originate here.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { productRouteLoaders } from "./lib/productRouteLoaders";
import { documentTitleForPath } from "./lib/routeDocumentTitle";

const Dashboard = lazy(productRouteLoaders["/"]);
const Analyze = lazy(productRouteLoaders["/analyze"]);
const Coach = lazy(productRouteLoaders["/coach"]);
const Games = lazy(productRouteLoaders["/games"]);
const Learn = lazy(productRouteLoaders["/learn"]);
const Openings = lazy(productRouteLoaders["/learn/openings"]);
const Play = lazy(productRouteLoaders["/play"]);
const Puzzles = lazy(productRouteLoaders["/puzzles"]);
const Progress = lazy(productRouteLoaders["/progress"]);
const OpeningDetail = lazy(() => import("./pages/OpeningDetail"));
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

function RouteDocumentTitle() {
  const [location] = useLocation();

  useEffect(() => {
    document.title = documentTitleForPath(location);
  }, [location]);

  return null;
}

function RouteAnnouncement() {
  const [location] = useLocation();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setAnnouncement(`${documentTitleForPath(location)} loaded`);
  }, [location]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );
}

function RouteFocusManagement() {
  const [location] = useLocation();
  const previousLocationRef = useRef(location);

  useEffect(() => {
    if (previousLocationRef.current === location) return;
    previousLocationRef.current = location;

    const focusMainContent = () => {
      const heading = document.querySelector<HTMLElement>("main h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
        return true;
      }

      const target = document.getElementById("main-content");
      if (!target) return false;
      target.focus();
      return true;
    };

    if (focusMainContent()) return;

    const observer = new MutationObserver(() => {
      if (focusMainContent()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timeoutId = window.setTimeout(() => observer.disconnect(), 2000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <RouteDocumentTitle />
      <RouteAnnouncement />
      <RouteFocusManagement />
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
    </>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider><Toaster position="bottom-right" /><Router /></ThemeProvider></ErrorBoundary>;
}

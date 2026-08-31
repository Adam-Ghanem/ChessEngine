/**
 * ChessIQ production web shell. Vercel currently builds from web/, so all live product routes originate here.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Analyze from "./pages/Analyze";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Play from "./pages/Play";
import Puzzles from "./pages/Puzzles";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/play" component={Play} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/review" component={Home} />
      <Route path="/learn" component={Learn} />
      <Route path="/puzzles" component={Puzzles} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

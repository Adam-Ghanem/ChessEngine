/**
 * ChessIQ production web shell. Vercel currently builds from web/, so all live product routes originate here.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Analyze from "./pages/Analyze";
import Coach from "./pages/Coach";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Learn from "./pages/Learn";
import Openings from "./pages/Openings";
import Play from "./pages/Play";
import Puzzles from "./pages/Puzzles";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/play" component={Play} />
      <Route path="/games" component={Games} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/review" component={Analyze} />
      <Route path="/learn/openings" component={Openings} />
      <Route path="/learn" component={Learn} />
      <Route path="/puzzles" component={Puzzles} />
      <Route path="/progress" component={Progress} />
      <Route path="/coach" component={Coach} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

/**
 * ChessIQ Intelligence in Motion: global shell centralizes public theme behavior and routes future product surfaces.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PlayPage from "./pages/PlayPage";
import AnalyzePage from "./pages/AnalyzePage";
import LearnPage from "./pages/LearnPage";
import PuzzlesPage from "./pages/PuzzlesPage";
import GamesPage from "./pages/GamesPage";
import ProgressPage from "./pages/ProgressPage";
import CoachPage from "./pages/CoachPage";

function Router() { return <Switch><Route path="/" component={PlayPage} /><Route path="/play" component={PlayPage} /><Route path="/analyze" component={AnalyzePage} /><Route path="/learn" component={LearnPage} /><Route path="/puzzles" component={PuzzlesPage} /><Route path="/games" component={GamesPage} /><Route path="/progress" component={ProgressPage} /><Route path="/coach" component={CoachPage} /><Route path="/review" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() {
  return <ErrorBoundary><ThemeProvider><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

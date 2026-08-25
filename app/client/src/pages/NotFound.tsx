/** ChessIQ Intelligence in Motion: concise recoverable empty state for missing product routes. */
import { ArrowLeft, SearchX } from "lucide-react";
import { useLocation } from "wouter";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return <main className="chessiq-state-page"><div className="state-grid" /><section className="state-card"><BrandMark /><SearchX size={38} aria-hidden="true" /><p className="eyebrow">Route unavailable</p><h1>This line has no continuation.</h1><p>The requested ChessIQ view is not available yet. Return to analysis to continue from the current position.</p><button onClick={() => setLocation("/")}><ArrowLeft size={16} />Return to analysis</button></section></main>;
}

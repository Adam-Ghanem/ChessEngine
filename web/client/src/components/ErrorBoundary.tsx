/** ChessIQ Intelligence in Motion: recovery state that preserves a calm analytical tone. */
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <main className="chessiq-state-page"><div className="state-grid" /><section className="state-card"><BrandMark /><AlertTriangle size={38} aria-hidden="true" /><p className="eyebrow">Analysis interrupted</p><h1>The calculation stopped.</h1><p>ChessIQ could not complete this view. Reload the workspace to continue from a clean position.</p><button onClick={() => window.location.reload()}><RotateCcw size={16} />Reload workspace</button></section></main>;
    return this.props.children;
  }
}

export default ErrorBoundary;

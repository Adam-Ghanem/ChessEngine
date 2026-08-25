/**
 * ChessIQ Intelligence in Motion: typed presentation contracts decoupled from the C++/WASM engine.
 */
export type PieceColor = "white" | "black";
export type AnalysisMode = "beginner" | "advanced";

export type MoveClassification =
  | "BOOK"
  | "GOOD"
  | "EXCELLENT"
  | "BEST"
  | "GREAT"
  | "BRILLIANT"
  | "INACCURACY"
  | "MISTAKE"
  | "BLUNDER";

export type ClassificationTone = "muted" | "teal" | "violet" | "gold" | "positive" | "warning" | "danger";

export interface Evaluation {
  score: number;
  mateIn?: number;
  perspective: PieceColor;
}

export interface EngineLine {
  rank: number;
  bestMove: string;
  pv: string;
  depth?: number;
  nodes?: string;
}

export interface AnalysisMove {
  id: string;
  fullMove: number;
  side: PieceColor;
  san: string;
  uci: string;
  from: string;
  to: string;
  fen: string;
  evaluation: Evaluation;
  classification: MoveClassification;
  depth?: number;
  nodes?: string;
  bestMove: string;
  pv: string;
  explanation: string;
  tacticalEvent?: string;
}

export interface CriticalMoment {
  id: string;
  moveIndex: number;
  whyItMatters: string;
  evaluationBefore: number;
  evaluationAfter: number;
  practiceIndex?: number;
}

export interface GameAnalysis {
  id: string;
  title: string;
  opening: string;
  moves: AnalysisMove[];
  criticalMoments: CriticalMoment[];
}

export interface ClassificationMeta {
  label: string;
  shortLabel: string;
  tone: ClassificationTone;
  symbol: string;
  description: string;
}

export const classificationMeta: Record<MoveClassification, ClassificationMeta> = {
  BOOK: { label: "Book", shortLabel: "BK", tone: "muted", symbol: "·", description: "Known opening continuation" },
  GOOD: { label: "Good", shortLabel: "+", tone: "muted", symbol: "+", description: "Sound practical move" },
  EXCELLENT: { label: "Excellent", shortLabel: "✓", tone: "positive", symbol: "✓", description: "Strong accurate move" },
  BEST: { label: "Best", shortLabel: "!", tone: "teal", symbol: "!", description: "Engine preferred move" },
  GREAT: { label: "Great", shortLabel: "!", tone: "violet", symbol: "✦", description: "High-value tactical move" },
  BRILLIANT: { label: "Brilliant", shortLabel: "!!", tone: "gold", symbol: "✦", description: "Exceptional strategic or tactical insight" },
  INACCURACY: { label: "Inaccuracy", shortLabel: "?!", tone: "warning", symbol: "?!", description: "Small avoidable evaluation loss" },
  MISTAKE: { label: "Mistake", shortLabel: "?", tone: "warning", symbol: "?", description: "Meaningful avoidable evaluation loss" },
  BLUNDER: { label: "Blunder", shortLabel: "??", tone: "danger", symbol: "!!", description: "Major game-changing evaluation loss" },
};

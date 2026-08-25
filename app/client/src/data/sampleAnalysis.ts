/**
 * ChessIQ Intelligence in Motion: explicitly local sample data ready to be replaced by PGN and WASM adapters.
 */
import type { AnalysisMove, CriticalMoment, GameAnalysis } from "@/types/analysis";

export const sampleMoves: AnalysisMove[] = [
  { id: "1w", fullMove: 1, side: "white", san: "e4", uci: "e2e4", from: "e2", to: "e4", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", evaluation: { score: 0.18, perspective: "white" }, classification: "BOOK", depth: 18, nodes: "1.1M", bestMove: "1… c5", pv: "1… c5 2. Nf3 Nc6 3. Bb5", explanation: "The center is claimed early, keeping open structures and development options available." },
  { id: "1b", fullMove: 1, side: "black", san: "c5", uci: "c7c5", from: "c7", to: "c5", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", evaluation: { score: 0.12, perspective: "white" }, classification: "BOOK", depth: 18, nodes: "1.3M", bestMove: "2. Nf3", pv: "2. Nf3 Nc6 3. Bb5 a6", explanation: "Black immediately challenges the central pawn and invites an open tactical structure." },
  { id: "2w", fullMove: 2, side: "white", san: "Nf3", uci: "g1f3", from: "g1", to: "f3", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", evaluation: { score: 0.22, perspective: "white" }, classification: "EXCELLENT", depth: 20, nodes: "1.8M", bestMove: "2… Nc6", pv: "2… Nc6 3. Bb5 a6 4. Ba4", explanation: "Development arrives with pressure on the center and a clear path to castling." },
  { id: "2b", fullMove: 2, side: "black", san: "Nc6", uci: "b8c6", from: "b8", to: "c6", fen: "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", evaluation: { score: 0.19, perspective: "white" }, classification: "BEST", depth: 20, nodes: "2.0M", bestMove: "3. Bb5", pv: "3. Bb5 a6 4. Ba4 Nf6", explanation: "The natural developing move keeps the central tension intact." },
  { id: "3w", fullMove: 3, side: "white", san: "Bb5", uci: "f1b5", from: "f1", to: "b5", fen: "r1bqkbnr/pp1ppppp/2n5/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", evaluation: { score: 0.36, perspective: "white" }, classification: "BRILLIANT", depth: 22, nodes: "3.4M", bestMove: "3… a6", pv: "3… a6 4. Ba4 Nf6 5. O-O", tacticalEvent: "Development pin", explanation: "The bishop asks Black to resolve a development question before the center is settled." },
  { id: "3b", fullMove: 3, side: "black", san: "a6", uci: "a7a6", from: "a7", to: "a6", fen: "r1bqkbnr/1p1ppppp/p1n5/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4", evaluation: { score: 0.32, perspective: "white" }, classification: "BEST", depth: 22, nodes: "3.9M", bestMove: "4. Ba4", pv: "4. Ba4 Nf6 5. O-O e6", explanation: "A measured question to the bishop preserves Black’s central options." },
  { id: "4w", fullMove: 4, side: "white", san: "Ba4", uci: "b5a4", from: "b5", to: "a4", fen: "r1bqkbnr/1p1ppppp/p1n5/pB6/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 4", evaluation: { score: 0.41, perspective: "white" }, classification: "GOOD", depth: 23, nodes: "4.2M", bestMove: "4… Nf6", pv: "4… Nf6 5. O-O e6 6. Re1", explanation: "The bishop retains pressure while keeping future central play flexible." },
  { id: "4b", fullMove: 4, side: "black", san: "Nf6", uci: "g8f6", from: "g8", to: "f6", fen: "r1bqkb1r/1p1ppppp/p1n2n2/1B6/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5", evaluation: { score: 0.35, perspective: "white" }, classification: "EXCELLENT", depth: 23, nodes: "4.5M", bestMove: "5. O-O", pv: "5. O-O e6 6. Re1 b5", explanation: "Development creates immediate pressure on e4 without committing the king." },
  { id: "5w", fullMove: 5, side: "white", san: "O-O", uci: "e1g1", from: "e1", to: "g1", fen: "r1bqkb1r/1p1ppppp/p1n2n2/1B6/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 3 5", evaluation: { score: 0.49, perspective: "white" }, classification: "BEST", depth: 24, nodes: "5.8M", bestMove: "5… e6", pv: "5… e6 6. Re1 b5 7. Bb3", explanation: "King safety completes White’s opening plan and connects the rooks." },
  { id: "5b", fullMove: 5, side: "black", san: "e6", uci: "e7e6", from: "e7", to: "e6", fen: "r1bqkb1r/1p2pppp/p1n1pn2/1B6/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6", evaluation: { score: 0.54, perspective: "white" }, classification: "GOOD", depth: 24, nodes: "6.2M", bestMove: "6. Re1", pv: "6. Re1 b5 7. Bb3 Be7", explanation: "The e-pawn develops the bishop but leaves the central tactical timing unresolved." },
  { id: "6w", fullMove: 6, side: "white", san: "Re1", uci: "f1e1", from: "f1", to: "e1", fen: "r1bqkb1r/1p2pppp/p1n1pn2/1B6/4P3/5N2/PPPP1PPP/RNBQR1K1 b kq - 1 6", evaluation: { score: 1.42, perspective: "white" }, classification: "GREAT", depth: 24, nodes: "7.4M", bestMove: "6… b5", pv: "6… b5 7. Bb3 Be7 8. c3 O-O", tacticalEvent: "Central pressure", explanation: "Re1 is stronger because it protects the bishop and reserves a central break before Black can coordinate." },
  { id: "6b", fullMove: 6, side: "black", san: "b5?", uci: "b7b5", from: "b7", to: "b5", fen: "r1bqkb1r/3npppp/p1n1pn2/1p6/4P3/5N2/PPPP1PPP/RNBQR1K1 w kq - 0 7", evaluation: { score: 2.14, perspective: "white" }, classification: "MISTAKE", depth: 24, nodes: "7.7M", bestMove: "6… Be7", pv: "6… Be7 7. c3 O-O 8. d4", tacticalEvent: "Loose queenside", explanation: "The pawn push creates space, but it loses a defensive tempo before Black’s king is secure." },
  { id: "7w", fullMove: 7, side: "white", san: "Bb3", uci: "a4b3", from: "a4", to: "b3", fen: "r1bqkb1r/3npppp/p1n1pn2/1p6/4P3/1B3N2/PPPP1PPP/RNBQR1K1 b kq - 1 7", evaluation: { score: 2.28, perspective: "white" }, classification: "EXCELLENT", depth: 25, nodes: "8.9M", bestMove: "7… Be7", pv: "7… Be7 8. c3 O-O 9. d4", explanation: "The bishop stays on the key diagonal while keeping Black’s queenside weaknesses in view." },
];

export const sampleCriticalMoments: CriticalMoment[] = [
  { id: "pin", moveIndex: 4, evaluationBefore: 0.19, evaluationAfter: 0.36, whyItMatters: "The pin limits Black’s development and gives White a clearer central plan." },
  { id: "centralize", moveIndex: 10, evaluationBefore: 0.54, evaluationAfter: 1.42, whyItMatters: "The rook coordinates with the bishop before Black can release the tension." },
  { id: "mistake", moveIndex: 11, evaluationBefore: 1.42, evaluationAfter: 2.14, practiceIndex: 10, whyItMatters: "The queenside becomes loose while Black’s king is still in the center." },
];

export const sampleGame: GameAnalysis = {
  id: "local-sicilian-study",
  title: "Local study",
  opening: "Sicilian structure",
  moves: sampleMoves,
  criticalMoments: sampleCriticalMoments,
};

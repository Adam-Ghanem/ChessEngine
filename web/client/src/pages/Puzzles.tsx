import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { LegalChessBoard } from "@/components/LegalChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { fetchLegalMoves, playMove } from "@/engine/playEngine";
import { evaluatePuzzleMove } from "@/engine/puzzleState";
import { PUZZLE_IDS, PUZZLE_STORAGE_KEY, PUZZLES as puzzles } from "@/lib/puzzleCatalog";

type PuzzleFeedback = "idle" | "incorrect" | "progress" | "solved";

function loadSolved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PUZZLE_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter((item): item is string => typeof item === "string" && PUZZLE_IDS.has(item));
    return Array.from(new Set(valid));
  } catch {
    return [];
  }
}

function findNextUnsolvedIndex(currentIndex: number, solvedIds: string[]) {
  for (let offset = 1; offset < puzzles.length; offset += 1) {
    const candidateIndex = (currentIndex + offset) % puzzles.length;
    if (!solvedIds.includes(puzzles[candidateIndex].id)) return candidateIndex;
  }
  return null;
}

export default function Puzzles() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [solved, setSolved] = useState<string[]>(loadSolved);
  const [fen, setFen] = useState(puzzles[0].fen);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [feedback, setFeedback] = useState<PuzzleFeedback>("idle");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const puzzle = puzzles[activeIndex];
  const isSolved = solved.includes(puzzle.id);
  const solvedCount = solved.length;
  const remainingCount = puzzles.length - solvedCount;
  const nextUnsolvedIndex = useMemo(() => findNextUnsolvedIndex(activeIndex, solved), [activeIndex, solved]);

  useEffect(() => {
    let cancelled = false;
    setFen(puzzle.fen);
    setAttemptIndex(0);
    setFeedback("idle");
    setError(null);
    setBusy(true);
    fetchLegalMoves(puzzle.fen)
      .then(result => { if (!cancelled) setLegalMoves(result.legalMoves); })
      .catch(cause => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load puzzle position"); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [puzzle.id, puzzle.fen]);

  function persistSolved() {
    if (solved.includes(puzzle.id)) return;
    const next = [...solved, puzzle.id];
    setSolved(next);
    localStorage.setItem(PUZZLE_STORAGE_KEY, JSON.stringify(next));
  }

  async function handlePuzzleMove(move: string) {
    if (busy || feedback === "solved") return;
    const evaluation = evaluatePuzzleMove(puzzle.solution, attemptIndex, move);
    if (!evaluation.accepted) {
      setFeedback("incorrect");
      toast.error("That move is legal, but it is not the tactical solution.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await playMove(fen, move);
      setFen(result.fen);
      setLegalMoves(result.legalMoves);
      setAttemptIndex(evaluation.nextIndex);
      if (evaluation.solved) {
        persistSolved();
        setFeedback("solved");
        toast.success("Puzzle solved on the board.");
      } else {
        setFeedback("progress");
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Puzzle move failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function restartPuzzle() {
    setFen(puzzle.fen);
    setAttemptIndex(0);
    setFeedback("idle");
    setError(null);
    setBusy(true);
    try {
      const result = await fetchLegalMoves(puzzle.fen);
      setLegalMoves(result.legalMoves);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reload puzzle position");
    } finally {
      setBusy(false);
    }
  }

  function selectPuzzle(index: number) {
    setActiveIndex(index);
  }

  function resetProgress() {
    setSolved([]);
    localStorage.removeItem(PUZZLE_STORAGE_KEY);
    toast("Puzzle progress reset.");
  }

  function openNextUnsolvedPuzzle() {
    if (nextUnsolvedIndex === null) return;
    selectPuzzle(nextUnsolvedIndex);
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="puzzles-product-shell">
        <ProductHeader activePath="/puzzles" />

        <section className="puzzles-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Training</div>
            <h1>Calculate before you move.</h1>
            <p>Every move is made on the board and checked through the same first-party ChessEngine legality path used by Play.</p>
          </div>
          <div className="puzzles-stats" aria-label="Puzzle training progress">
            <div><Trophy size={16} /><span>Solved</span><strong>{solvedCount}/{puzzles.length}</strong></div>
            <div><Target size={16} /><span>Remaining</span><strong>{remainingCount}</strong></div>
          </div>
        </section>

        <div className="puzzles-layout">
          <aside className="puzzle-queue" aria-label="Puzzle queue">
            <div className="analysis-section-heading"><div><span className="analysis-label">Training set</span><h2>Puzzles</h2></div><Target size={18} /></div>
            <div className="puzzle-queue-list">
              {puzzles.map((item, index) => (
                <button key={item.id} className={index === activeIndex ? "is-active" : ""} onClick={() => selectPuzzle(index)} aria-pressed={index === activeIndex}>
                  <span>{solved.includes(item.id) ? <CheckCircle2 size={16} /> : index + 1}</span>
                  <div><strong>{item.title}</strong><small>{item.difficulty} · {item.theme}</small></div>
                </button>
              ))}
            </div>
            <button className="puzzle-reset" onClick={resetProgress}><RotateCcw size={15} /> Reset progress</button>
          </aside>

          <section className="puzzle-stage" aria-labelledby="puzzle-title">
            <header className="puzzle-stage-header">
              <div><span className="analysis-label">{puzzle.difficulty} · {puzzle.theme}</span><h2 id="puzzle-title">{puzzle.title}</h2><p>{puzzle.prompt}</p></div>
              {isSolved && <span className="puzzle-solved-chip"><CheckCircle2 size={15} /> Solved</span>}
            </header>

            <div className="puzzle-board-wrap">
              <LegalChessBoard
                fen={fen}
                legalMoves={legalMoves}
                disabled={busy || feedback === "solved"}
                onMove={handlePuzzleMove}
                ariaLabel={`${puzzle.title} puzzle board`}
              />
            </div>

            <div className="puzzle-answer-panel">
              <div className="analysis-section-heading compact"><div><span className="analysis-label">Board attempt</span><h2>Find the move</h2></div><Lightbulb size={18} /></div>
              <p className="sidebar-note">Select a piece, then play one of its engine-verified legal destinations. ChessIQ checks the UCI move against the curated solution line.</p>
              {error && <div className="puzzle-feedback" role="alert"><strong>Engine error.</strong><p>{error}</p></div>}
              {feedback !== "idle" && !error && (
                <div className={feedback === "solved" ? "puzzle-feedback is-success" : "puzzle-feedback"} role="status" aria-live="polite">
                  <strong>{feedback === "solved" ? "Correct." : feedback === "progress" ? "Correct — continue the line." : "Keep calculating."}</strong>
                  <p>{feedback === "solved" ? puzzle.explanation : feedback === "incorrect" ? "That move is legal, but it is not the tactical solution. The position has not changed." : "Play the next move in the solution line."}</p>
                </div>
              )}
              <div className="puzzle-next-row">
                <button type="button" className="lesson-secondary" onClick={restartPuzzle} disabled={busy}><RotateCcw size={15} /> Reset position</button>
                <Link href="/learn" className="lesson-secondary">Study the concept</Link>
                <button className="lesson-primary primary-action" disabled={feedback !== "solved" || nextUnsolvedIndex === null} onClick={openNextUnsolvedPuzzle}>{nextUnsolvedIndex === null && solvedCount === puzzles.length ? "Set complete" : "Next puzzle"}</button>
              </div>
            </div>
          </section>
        </div>

        <footer className="chessiq-footer product-footer"><BrandMark compact /><p>Play. Analyze. Learn. Improve.</p><span>ChessIQ engine-backed puzzle training</span></footer>
      </div>
    </main>
  );
}

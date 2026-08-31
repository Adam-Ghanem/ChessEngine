import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Moon, RotateCcw, ShieldCheck, Sparkles, Sun, Swords } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";
import { useTheme } from "@/contexts/ThemeContext";
import { fetchLegalMoves, playMove } from "@/engine/playEngine";
import type { PieceColor } from "@/types/analysis";
import "@/play.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
type BoardPiece = { color: PieceColor; kind: ChessPieceKind };

function decodeFen(fen: string) {
  const board = new Map<string, BoardPiece>();
  fen.split(" ")[0].split("/").forEach((row, rowIndex) => {
    let fileIndex = 0;
    for (const token of row) {
      if (/\d/.test(token)) fileIndex += Number(token);
      else {
        board.set(`${files[fileIndex]}${ranks[rowIndex]}`, {
          color: token === token.toUpperCase() ? "white" : "black",
          kind: token.toUpperCase() as ChessPieceKind,
        });
        fileIndex += 1;
      }
    }
  });
  return board;
}

function sideToMove(fen: string): PieceColor {
  return fen.split(" ")[1] === "b" ? "black" : "white";
}

export default function Play() {
  const { theme, toggleTheme } = useTheme();
  const [fen, setFen] = useState(START_FEN);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([START_FEN]);
  const [moves, setMoves] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const board = useMemo(() => decodeFen(fen), [fen]);
  const turn = sideToMove(fen);
  const targets = useMemo(() => selected ? legalMoves.filter(move => move.startsWith(selected)).map(move => move.slice(2, 4)) : [], [legalMoves, selected]);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    fetchLegalMoves(fen)
      .then(result => { if (!cancelled) { setLegalMoves(result.legalMoves); setError(null); } })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load legal moves"); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [fen]);

  async function chooseSquare(square: string) {
    if (busy) return;
    const piece = board.get(square);
    if (!selected) {
      if (piece?.color === turn && legalMoves.some(move => move.startsWith(square))) setSelected(square);
      return;
    }
    if (piece?.color === turn) {
      setSelected(legalMoves.some(move => move.startsWith(square)) ? square : null);
      return;
    }
    if (!targets.includes(square)) {
      setSelected(null);
      return;
    }

    const movingPiece = board.get(selected);
    const promotion = movingPiece?.kind === "P" && (square.endsWith("1") || square.endsWith("8")) ? "q" : "";
    const uci = `${selected}${square}${promotion}`;
    setBusy(true);
    setError(null);
    try {
      const result = await playMove(fen, uci);
      setFen(result.fen);
      setLegalMoves(result.legalMoves);
      setHistory(current => [...current, result.fen]);
      setMoves(current => [...current, uci]);
      setSelected(null);
      if (result.legalMoves.length === 0) toast.success("Game over — no legal moves remain.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Move failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function resetGame() {
    setFen(START_FEN);
    setHistory([START_FEN]);
    setMoves([]);
    setSelected(null);
    toast("New local game ready.");
  }

  function undoMove() {
    if (history.length <= 1) return;
    const nextHistory = history.slice(0, -1);
    setHistory(nextHistory);
    setFen(nextHistory[nextHistory.length - 1]);
    setMoves(current => current.slice(0, -1));
    setSelected(null);
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell play-product-shell">
        <header className="app-header product-header">
          <Link href="/analyze" className="brand-link" aria-label="Open ChessIQ Analyze"><BrandMark /></Link>
          <nav className="app-nav" aria-label="Primary navigation">
            <Link className="nav-item is-active" href="/play" aria-current="page">Play</Link>
            <Link className="nav-item" href="/analyze">Analyze</Link>
            <Link className="nav-item" href="/learn">Learn</Link>
            <Link className="nav-item" href="/puzzles">Puzzles</Link>
          </nav>
          <div className="header-actions">
            <button className="theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <section className="play-hero">
          <div><div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Play</div><h1>Play real chess. Keep the engine in charge of legality.</h1><p>A fast local board backed by the same first-party C++ ChessEngine used by analysis.</p></div>
          <div className="play-status" aria-live="polite"><span>{busy ? "Checking position" : `${turn === "white" ? "White" : "Black"} to move`}</span><strong>{legalMoves.length} legal moves</strong></div>
        </section>

        <section className="play-layout">
          <div className="play-board-card">
            <div className="play-board" role="grid" aria-label="Playable chess board">
              {ranks.map((rank, row) => files.map((file, column) => {
                const square = `${file}${rank}`;
                const piece = board.get(square);
                const isSelected = square === selected;
                const isTarget = targets.includes(square);
                return <button key={square} type="button" role="gridcell" className={`play-square ${(row + column) % 2 === 0 ? "is-light" : "is-dark"} ${isSelected ? "is-selected" : ""} ${isTarget ? "is-target" : ""}`} onClick={() => chooseSquare(square)} aria-label={piece ? `${piece.color} ${piece.kind} on ${square}` : `Empty ${square}`} aria-pressed={isSelected}>
                  {piece && <ChessPiece color={piece.color} kind={piece.kind} />}
                  {isTarget && <span className="play-target" aria-hidden="true" />}
                  {column === 0 && <span className="rank-label">{rank}</span>}
                  {row === 7 && <span className="file-label">{file}</span>}
                </button>;
              }))}
            </div>
            {error && <p className="play-error" role="alert">{error}</p>}
            <div className="play-board-actions">
              <button type="button" onClick={undoMove} disabled={history.length <= 1 || busy}><ArrowLeft size={15} /> Undo</button>
              <button type="button" onClick={resetGame} disabled={busy}><RotateCcw size={15} /> New game</button>
            </div>
          </div>

          <aside className="play-rail" aria-label="Game details">
            <div className="play-rail-card"><span className="analysis-label">Rules authority</span><h2><ShieldCheck size={18} /> ChessEngine 0.3</h2><p>Every candidate move is accepted only when the first-party engine reports it as legal.</p></div>
            <div className="play-rail-card"><span className="analysis-label">Move list</span><h2><Swords size={18} /> Local game</h2><div className="play-move-list">{moves.length ? moves.map((move, index) => <span key={`${move}-${index}`}>{index + 1}. {move}</span>) : <p>No moves yet. Select a piece to begin.</p>}</div></div>
            <Link href="/analyze" className="primary-action play-analyze-link">Open Analyze</Link>
          </aside>
        </section>
      </div>
    </main>
  );
}

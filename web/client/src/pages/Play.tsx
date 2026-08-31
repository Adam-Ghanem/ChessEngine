import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, RotateCcw, ShieldCheck, Sparkles, Swords, Users } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";
import { ProductHeader } from "@/components/ProductHeader";
import { fetchLegalMoves, playMove, type PlayEngineStatus } from "@/engine/playEngine";
import { moveTargets, sideToMove, statusLabel } from "@/engine/playState";
import { analyzePosition } from "@/engine/serverEngine";
import type { PieceColor } from "@/types/analysis";
import "@/play.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
type BoardPiece = { color: PieceColor; kind: ChessPieceKind };
type PlayMode = "local" | "computer";

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

function isTerminal(status: PlayEngineStatus) {
  return status === "checkmate" || status === "stalemate" || status === "draw";
}

function announceTerminal(status: PlayEngineStatus) {
  if (status === "checkmate") toast.success("Checkmate. Game over.");
  else if (status === "stalemate") toast("Stalemate. Game drawn.");
  else if (status === "draw") toast("Draw. Game over.");
}

export default function Play() {
  const [mode, setMode] = useState<PlayMode>("computer");
  const [fen, setFen] = useState(START_FEN);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<PlayEngineStatus>("ongoing");
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([START_FEN]);
  const [moves, setMoves] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [computerThinking, setComputerThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const board = useMemo(() => decodeFen(fen), [fen]);
  const turn = sideToMove(fen);
  const targets = useMemo(() => selected ? moveTargets(legalMoves, selected) : [], [legalMoves, selected]);
  const terminal = isTerminal(status);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    fetchLegalMoves(fen)
      .then(result => {
        if (!cancelled) {
          setLegalMoves(result.legalMoves);
          setStatus(result.status);
          setError(null);
        }
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load legal moves"); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [fen]);

  async function applyComputerReply(positionFen: string, availableMoves: string[]) {
    if (!availableMoves.length) return;
    setComputerThinking(true);
    try {
      const analysis = await analyzePosition(positionFen, 5);
      const engineMove = analysis.bestMove.trim().split(/\s+/)[0];
      if (!availableMoves.includes(engineMove)) throw new Error(`ChessEngine returned an illegal reply: ${engineMove}`);
      const reply = await playMove(positionFen, engineMove);
      setFen(reply.fen);
      setLegalMoves(reply.legalMoves);
      setStatus(reply.status);
      setHistory(current => [...current, reply.fen]);
      setMoves(current => [...current, engineMove]);
      if (isTerminal(reply.status)) announceTerminal(reply.status);
    } finally {
      setComputerThinking(false);
    }
  }

  async function chooseSquare(square: string) {
    if (busy || computerThinking || terminal || (mode === "computer" && turn !== "white")) return;
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
      setStatus(result.status);
      setHistory(current => [...current, result.fen]);
      setMoves(current => [...current, uci]);
      setSelected(null);
      if (isTerminal(result.status)) {
        announceTerminal(result.status);
      } else if (mode === "computer") {
        await applyComputerReply(result.fen, result.legalMoves);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Move failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function resetGame(nextMode: PlayMode = mode) {
    setMode(nextMode);
    setFen(START_FEN);
    setStatus("ongoing");
    setHistory([START_FEN]);
    setMoves([]);
    setSelected(null);
    setError(null);
    setComputerThinking(false);
    if (fen === START_FEN) {
      setBusy(true);
      fetchLegalMoves(START_FEN)
        .then(result => {
          setLegalMoves(result.legalMoves);
          setStatus(result.status);
        })
        .catch(err => setError(err instanceof Error ? err.message : "Unable to load legal moves"))
        .finally(() => setBusy(false));
    }
    toast(nextMode === "computer" ? "New game vs ChessIQ ready." : "New local game ready.");
  }

  function undoMove() {
    if (history.length <= 1 || busy || computerThinking) return;
    const pliesToUndo = mode === "computer" && turn === "white" && moves.length >= 2 ? 2 : 1;
    const nextHistory = history.slice(0, Math.max(1, history.length - pliesToUndo));
    setHistory(nextHistory);
    setFen(nextHistory[nextHistory.length - 1]);
    setStatus("ongoing");
    setMoves(current => current.slice(0, Math.max(0, current.length - pliesToUndo)));
    setSelected(null);
  }

  const statusText = computerThinking
    ? "ChessIQ is thinking"
    : busy
      ? "Checking position"
      : terminal
        ? statusLabel(status, turn)
        : mode === "computer" && turn === "black"
          ? status === "check" ? "ChessIQ to move · Check" : "ChessIQ to move"
          : statusLabel(status, turn);

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell play-product-shell">
        <ProductHeader activePath="/play" />

        <section className="play-hero">
          <div><div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Play</div><h1>Play real chess. Challenge your own engine.</h1><p>Choose a local board or play White against the same first-party C++ ChessEngine that powers ChessIQ analysis.</p></div>
          <div className="play-status" aria-live="polite"><span>{statusText}</span><strong>{terminal ? "Game finished" : `${legalMoves.length} legal moves`}</strong></div>
        </section>

        <section className="play-mode-switcher" aria-label="Play mode">
          <button type="button" className={mode === "computer" ? "is-active" : ""} aria-pressed={mode === "computer"} onClick={() => resetGame("computer")} disabled={busy || computerThinking}>
            <Bot size={17} /><span><strong>Play ChessIQ</strong><small>You are White · Engine replies</small></span>
          </button>
          <button type="button" className={mode === "local" ? "is-active" : ""} aria-pressed={mode === "local"} onClick={() => resetGame("local")} disabled={busy || computerThinking}>
            <Users size={17} /><span><strong>Local board</strong><small>Two players · One device</small></span>
          </button>
        </section>

        <section className="play-layout">
          <div className="play-board-card">
            <div className="play-board" role="grid" aria-label="Playable chess board">
              {ranks.map((rank, row) => files.map((file, column) => {
                const square = `${file}${rank}`;
                const piece = board.get(square);
                const isSelected = square === selected;
                const isTarget = targets.includes(square);
                return <button key={square} type="button" role="gridcell" className={`play-square ${(row + column) % 2 === 0 ? "is-light" : "is-dark"} ${isSelected ? "is-selected" : ""} ${isTarget ? "is-target" : ""}`} onClick={() => chooseSquare(square)} aria-label={piece ? `${piece.color} ${piece.kind} on ${square}` : `Empty ${square}`} aria-pressed={isSelected} disabled={computerThinking || terminal}>
                  {piece && <ChessPiece color={piece.color} kind={piece.kind} />}
                  {isTarget && <span className="play-target" aria-hidden="true" />}
                  {column === 0 && <span className="rank-label">{rank}</span>}
                  {row === 7 && <span className="file-label">{file}</span>}
                </button>;
              }))}
            </div>
            {error && <p className="play-error" role="alert">{error}</p>}
            <div className="play-board-actions">
              <button type="button" onClick={undoMove} disabled={history.length <= 1 || busy || computerThinking}><ArrowLeft size={15} /> Undo</button>
              <button type="button" onClick={() => resetGame()} disabled={busy || computerThinking}><RotateCcw size={15} /> New game</button>
            </div>
          </div>

          <aside className="play-rail" aria-label="Game details">
            <div className="play-rail-card"><span className="analysis-label">Rules authority</span><h2><ShieldCheck size={18} /> ChessEngine 0.3</h2><p>Every candidate move and game status is accepted only when the first-party engine reports it. In ChessIQ mode, that same engine calculates Black's reply.</p></div>
            <div className="play-rail-card"><span className="analysis-label">Move list</span><h2><Swords size={18} /> {mode === "computer" ? "vs ChessIQ" : "Local game"}</h2><div className="play-move-list">{moves.length ? moves.map((move, index) => <span key={`${move}-${index}`}>{index + 1}. {move}</span>) : <p>No moves yet. Select a piece to begin.</p>}</div></div>
            <Link href="/analyze" className="primary-action play-analyze-link">Open Analyze</Link>
          </aside>
        </section>
      </div>
    </main>
  );
}

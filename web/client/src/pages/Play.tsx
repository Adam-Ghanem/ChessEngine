import { useEffect, useState } from "react";
import { ArrowLeft, Bot, CircleDot, Flag, RotateCcw, ShieldCheck, Swords, Users } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { LegalChessBoard } from "@/components/LegalChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { fetchLegalMoves, playMove, type PlayEngineStatus } from "@/engine/playEngine";
import { sideToMove, statusLabel } from "@/engine/playState";
import { analyzePosition } from "@/engine/serverEngine";
import { saveGameSnapshot } from "@/lib/gameHistory";
import "@/play.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const INITIAL_CLOCK_SECONDS = 10 * 60;
type PlayMode = "local" | "computer";
type TimedOutSide = "white" | "black" | null;

function createGameId() {
  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isTerminal(status: PlayEngineStatus) {
  return status === "checkmate" || status === "stalemate" || status === "draw";
}

function announceTerminal(status: PlayEngineStatus) {
  if (status === "checkmate") toast.success("Checkmate. Game over.");
  else if (status === "stalemate") toast("Stalemate. Game drawn.");
  else if (status === "draw") toast("Draw. Game over.");
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}

export default function Play() {
  const [mode, setMode] = useState<PlayMode>("computer");
  const [gameId, setGameId] = useState(createGameId);
  const [fen, setFen] = useState(START_FEN);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<PlayEngineStatus>("ongoing");
  const [history, setHistory] = useState<string[]>([START_FEN]);
  const [moves, setMoves] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [computerThinking, setComputerThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whiteSeconds, setWhiteSeconds] = useState(INITIAL_CLOCK_SECONDS);
  const [blackSeconds, setBlackSeconds] = useState(INITIAL_CLOCK_SECONDS);
  const [timedOut, setTimedOut] = useState<TimedOutSide>(null);

  const turn = sideToMove(fen);
  const engineTerminal = isTerminal(status);
  const terminal = engineTerminal || timedOut !== null;
  const lastMove = moves.length ? moves[moves.length - 1] : null;
  const clockRunning = moves.length > 0 && !terminal && (!busy || computerThinking);

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

  useEffect(() => {
    if (!moves.length) return;
    saveGameSnapshot({ id: gameId, mode, status, fen, moves, updatedAt: new Date().toISOString() });
  }, [fen, gameId, mode, moves, status]);

  useEffect(() => {
    if (!clockRunning) return;
    const timer = window.setInterval(() => {
      if (turn === "white") setWhiteSeconds(current => Math.max(0, current - 1));
      else setBlackSeconds(current => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [clockRunning, turn]);

  useEffect(() => {
    if (timedOut || engineTerminal || !moves.length) return;
    if (whiteSeconds === 0) {
      setTimedOut("white");
      toast("White ran out of time. Black wins.");
    } else if (blackSeconds === 0) {
      setTimedOut("black");
      toast("Black ran out of time. White wins.");
    }
  }, [blackSeconds, engineTerminal, moves.length, timedOut, whiteSeconds]);

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

  async function handleBoardMove(uci: string) {
    if (busy || computerThinking || terminal || (mode === "computer" && turn !== "white")) return;
    setBusy(true);
    setError(null);
    try {
      const result = await playMove(fen, uci);
      setFen(result.fen);
      setLegalMoves(result.legalMoves);
      setStatus(result.status);
      setHistory(current => [...current, result.fen]);
      setMoves(current => [...current, uci]);
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
    setGameId(createGameId());
    setFen(START_FEN);
    setStatus("ongoing");
    setHistory([START_FEN]);
    setMoves([]);
    setError(null);
    setComputerThinking(false);
    setWhiteSeconds(INITIAL_CLOCK_SECONDS);
    setBlackSeconds(INITIAL_CLOCK_SECONDS);
    setTimedOut(null);
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
    setTimedOut(null);
    setMoves(current => current.slice(0, Math.max(0, current.length - pliesToUndo)));
  }

  const statusText = timedOut
    ? `${timedOut === "white" ? "White" : "Black"} ran out of time`
    : computerThinking
      ? "ChessIQ is thinking"
      : busy
        ? "Checking position"
        : engineTerminal
          ? statusLabel(status, turn)
          : mode === "computer" && turn === "black"
            ? status === "check" ? "ChessIQ to move · Check" : "ChessIQ to move"
            : statusLabel(status, turn);

  const blackName = mode === "computer" ? "ChessIQ" : "Black";
  const blackDetail = mode === "computer" ? "ChessEngine 0.3" : "Local player";
  const whiteName = mode === "computer" ? "You" : "White";
  const whiteDetail = mode === "computer" ? "Playing White" : "Local player";

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell play-product-shell">
        <ProductHeader activePath="/play" />

        <section className="play-game-room play-layout" aria-label="Chess game room">
          <div className="play-board-stage">
            <div className={`play-player-bar ${turn === "black" && !terminal ? "is-active" : ""}`}>
              <div className="play-player-identity">
                <span className="play-player-avatar"><Bot size={19} /></span>
                <span><strong>{blackName}</strong><small>{blackDetail}</small></span>
              </div>
              <div className="play-clock" aria-label={`${blackName} clock`}>{formatClock(blackSeconds)}</div>
            </div>

            <div className="play-board-card">
              <LegalChessBoard
                fen={fen}
                legalMoves={legalMoves}
                lastMove={lastMove}
                disabled={busy || computerThinking || terminal || (mode === "computer" && turn !== "white")}
                onMove={handleBoardMove}
              />
              {error && <p className="play-error" role="alert">{error}</p>}
            </div>

            <div className={`play-player-bar ${turn === "white" && !terminal ? "is-active" : ""}`}>
              <div className="play-player-identity">
                <span className="play-player-avatar is-user"><Users size={19} /></span>
                <span><strong>{whiteName}</strong><small>{whiteDetail}</small></span>
              </div>
              <div className="play-clock" aria-label={`${whiteName} clock`}>{formatClock(whiteSeconds)}</div>
            </div>
          </div>

          <aside className="game-panel play-rail" aria-label="Game panel">
            <div className="game-panel-status" aria-live="polite">
              <span><CircleDot size={13} /> {terminal ? "Game finished" : "Live game"}</span>
              <strong>{statusText}</strong>
              <small>{terminal ? "Start a new game to continue." : `${legalMoves.length} legal moves available`}</small>
            </div>

            <div className="play-mode-switcher" aria-label="Play mode">
              <button type="button" className={mode === "computer" ? "is-active" : ""} aria-pressed={mode === "computer"} onClick={() => resetGame("computer")} disabled={busy || computerThinking}>
                <Bot size={16} /><span><strong>Play ChessIQ</strong><small>vs engine</small></span>
              </button>
              <button type="button" className={mode === "local" ? "is-active" : ""} aria-pressed={mode === "local"} onClick={() => resetGame("local")} disabled={busy || computerThinking}>
                <Users size={16} /><span><strong>Local</strong><small>two players</small></span>
              </button>
            </div>

            <div className="game-panel-section game-moves-section">
              <div className="game-panel-heading"><span>Move list</span><Swords size={16} /></div>
              <div className="play-move-list">
                {moves.length ? Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => (
                  <div className="play-move-row" key={index}>
                    <span className="move-number">{index + 1}.</span>
                    <span>{moves[index * 2]}</span>
                    <span>{moves[index * 2 + 1] ?? ""}</span>
                  </div>
                )) : <p>No moves yet. Select a piece to begin.</p>}
              </div>
            </div>

            <div className="game-panel-engine"><ShieldCheck size={15} /><span>Moves verified by first-party ChessEngine</span></div>

            <div className="game-panel-actions">
              <button type="button" onClick={undoMove} disabled={history.length <= 1 || busy || computerThinking}><ArrowLeft size={15} /> Undo</button>
              <button type="button" onClick={() => resetGame()} disabled={busy || computerThinking}><RotateCcw size={15} /> New game</button>
            </div>
            <Link href="/analyze" className="primary-action play-analyze-link">Open Analyze</Link>
            {timedOut && <div className="game-timeout-note"><Flag size={14} /> Time control: 10 minutes</div>}
          </aside>
        </section>
      </div>
    </main>
  );
}

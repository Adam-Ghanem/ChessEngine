import { useEffect, useState } from "react";
import { ArrowLeft, Bot, CircleDot, Clock3, Flag, RotateCcw, ShieldCheck, Swords, Users } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { LegalChessBoard } from "@/components/LegalChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { PLAY_DIFFICULTIES, PLAY_DIFFICULTY_STORAGE_KEY, getPlayDifficulty, type PlayDifficultyId } from "@/engine/playDifficulty";
import { fetchLegalMoves, playMove, type PlayEngineStatus } from "@/engine/playEngine";
import { PLAY_SIDE_OPTIONS, PLAY_SIDE_STORAGE_KEY, getPlaySide, oppositeSide, resolvePlayerSide, type PlayerSide, type PlaySidePreference } from "@/engine/playSide";
import { sideToMove, statusLabel } from "@/engine/playState";
import { PLAY_TIME_CONTROLS, PLAY_TIME_CONTROL_STORAGE_KEY, getPlayTimeControl, type PlayTimeControl, type PlayTimeControlId } from "@/engine/playTimeControl";
import { analyzePosition } from "@/engine/serverEngine";
import { analysisHrefForFen } from "@/lib/analysisRoute";
import { saveGameSnapshot, type GameResult, type GameTermination } from "@/lib/gameHistory";
import "@/play.css";
import "@/play-difficulty.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
type PlayMode = "local" | "computer";
type TimedOutSide = PlayerSide | null;
type ResignedSide = PlayerSide | null;

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

function winnerWhen(sideLost: PlayerSide): GameResult {
  return sideLost === "white" ? "black-win" : "white-win";
}

function engineOutcome(status: PlayEngineStatus, turn: PlayerSide): { result?: GameResult; termination?: GameTermination } {
  if (status === "checkmate") return { result: winnerWhen(turn), termination: "checkmate" };
  if (status === "stalemate") return { result: "draw", termination: "stalemate" };
  if (status === "draw") return { result: "draw", termination: "draw" };
  return {};
}

export default function Play() {
  const [mode, setMode] = useState<PlayMode>("computer");
  const [difficulty, setDifficulty] = useState(() => {
    if (typeof window === "undefined") return getPlayDifficulty(null);
    return getPlayDifficulty(window.localStorage.getItem(PLAY_DIFFICULTY_STORAGE_KEY));
  });
  const [sidePreference, setSidePreference] = useState<PlaySidePreference>(() => {
    if (typeof window === "undefined") return getPlaySide(null);
    return getPlaySide(window.localStorage.getItem(PLAY_SIDE_STORAGE_KEY));
  });
  const [playerSide, setPlayerSide] = useState<PlayerSide>(() => {
    if (typeof window === "undefined") return "white";
    return resolvePlayerSide(getPlaySide(window.localStorage.getItem(PLAY_SIDE_STORAGE_KEY)));
  });
  const [timeControl, setTimeControl] = useState<PlayTimeControl>(() => {
    if (typeof window === "undefined") return getPlayTimeControl(null);
    return getPlayTimeControl(window.localStorage.getItem(PLAY_TIME_CONTROL_STORAGE_KEY));
  });
  const [gameId, setGameId] = useState(createGameId);
  const [fen, setFen] = useState(START_FEN);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<PlayEngineStatus>("ongoing");
  const [history, setHistory] = useState<string[]>([START_FEN]);
  const [moves, setMoves] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [computerThinking, setComputerThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whiteSeconds, setWhiteSeconds] = useState(() => timeControl.seconds);
  const [blackSeconds, setBlackSeconds] = useState(() => timeControl.seconds);
  const [timedOut, setTimedOut] = useState<TimedOutSide>(null);
  const [resignedSide, setResignedSide] = useState<ResignedSide>(null);

  const turn = sideToMove(fen);
  const engineTerminal = isTerminal(status);
  const terminal = engineTerminal || timedOut !== null || resignedSide !== null;
  const lastMove = moves.length ? moves[moves.length - 1] : null;
  const clockRunning = moves.length > 0 && !terminal && (!busy || computerThinking);
  const orientation: PlayerSide = mode === "computer" ? playerSide : "white";
  const topSide = oppositeSide(orientation);
  const bottomSide = orientation;

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
    if (mode !== "computer" || playerSide !== "black" || moves.length || turn !== "white" || busy || computerThinking || !legalMoves.length) return;
    void applyComputerReply(fen, legalMoves).catch(cause => {
      const message = cause instanceof Error ? cause.message : "ChessIQ opening move failed";
      setError(message);
      toast.error(message);
    });
  }, [busy, computerThinking, fen, legalMoves, mode, moves.length, playerSide, turn]);

  useEffect(() => {
    if (!moves.length) return;
    const outcome = resignedSide
      ? { result: winnerWhen(resignedSide), termination: "resignation" as const }
      : timedOut
        ? { result: winnerWhen(timedOut), termination: "timeout" as const }
        : engineOutcome(status, turn);
    saveGameSnapshot({ id: gameId, mode, status, fen, moves, positions: history, ...outcome, updatedAt: new Date().toISOString() });
  }, [fen, gameId, history, mode, moves, resignedSide, status, timedOut, turn]);

  useEffect(() => {
    if (!clockRunning) return;
    const timer = window.setInterval(() => {
      if (turn === "white") setWhiteSeconds(current => Math.max(0, current - 1));
      else setBlackSeconds(current => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [clockRunning, turn]);

  useEffect(() => {
    if (timedOut || resignedSide || engineTerminal || !moves.length) return;
    if (whiteSeconds === 0) {
      setTimedOut("white");
      toast("White ran out of time. Black wins.");
    } else if (blackSeconds === 0) {
      setTimedOut("black");
      toast("Black ran out of time. White wins.");
    }
  }, [blackSeconds, engineTerminal, moves.length, resignedSide, timedOut, whiteSeconds]);

  async function applyComputerReply(positionFen: string, availableMoves: string[]) {
    if (!availableMoves.length) return;
    setComputerThinking(true);
    try {
      const analysis = await analyzePosition(positionFen, difficulty.depth);
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
    if (busy || computerThinking || terminal || (mode === "computer" && turn !== playerSide)) return;
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

  function resetGame(
    nextMode: PlayMode = mode,
    nextPreference: PlaySidePreference = sidePreference,
    nextTimeControl: PlayTimeControl = timeControl,
  ) {
    setMode(nextMode);
    setPlayerSide(nextMode === "computer" ? resolvePlayerSide(nextPreference) : "white");
    setGameId(createGameId());
    setFen(START_FEN);
    setStatus("ongoing");
    setHistory([START_FEN]);
    setMoves([]);
    setError(null);
    setComputerThinking(false);
    setWhiteSeconds(nextTimeControl.seconds);
    setBlackSeconds(nextTimeControl.seconds);
    setTimedOut(null);
    setResignedSide(null);
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

  function selectDifficulty(id: PlayDifficultyId) {
    const next = getPlayDifficulty(id);
    setDifficulty(next);
    window.localStorage.setItem(PLAY_DIFFICULTY_STORAGE_KEY, next.id);
    toast(`ChessIQ strength set to ${next.label}.`);
  }

  function selectSidePreference(id: PlaySidePreference) {
    const next = getPlaySide(id);
    setSidePreference(next);
    window.localStorage.setItem(PLAY_SIDE_STORAGE_KEY, next);
    resetGame("computer", next);
  }

  function selectTimeControl(id: PlayTimeControlId) {
    const next = getPlayTimeControl(id);
    setTimeControl(next);
    window.localStorage.setItem(PLAY_TIME_CONTROL_STORAGE_KEY, next.id);
    resetGame(mode, sidePreference, next);
    toast(`Time control set to ${next.label}.`);
  }

  function resignGame() {
    if (!moves.length || terminal || busy || computerThinking) return;
    const side: PlayerSide = mode === "computer" ? playerSide : turn;
    const player = side === "white" ? whiteName : blackName;
    if (!window.confirm(`${player} resigns this game?`)) return;
    setResignedSide(side);
    toast(`${player} resigned. ${side === "white" ? blackName : whiteName} wins.`);
  }

  function undoMove() {
    if (history.length <= 1 || busy || computerThinking || terminal) return;
    const pliesToUndo = mode === "computer" && turn === playerSide && moves.length >= 2 ? 2 : 1;
    const nextHistory = history.slice(0, Math.max(1, history.length - pliesToUndo));
    setHistory(nextHistory);
    setFen(nextHistory[nextHistory.length - 1]);
    setStatus("ongoing");
    setTimedOut(null);
    setResignedSide(null);
    setMoves(current => current.slice(0, Math.max(0, current.length - pliesToUndo)));
  }

  const whiteName = mode === "computer" ? (playerSide === "white" ? "You" : "ChessIQ") : "White";
  const blackName = mode === "computer" ? (playerSide === "black" ? "You" : "ChessIQ") : "Black";
  const whiteDetail = mode === "computer"
    ? playerSide === "white" ? "Playing White" : `ChessEngine 0.3 · ${difficulty.label}`
    : "Local player";
  const blackDetail = mode === "computer"
    ? playerSide === "black" ? "Playing Black" : `ChessEngine 0.3 · ${difficulty.label}`
    : "Local player";

  function renderPlayerBar(side: PlayerSide) {
    const name = side === "white" ? whiteName : blackName;
    const detail = side === "white" ? whiteDetail : blackDetail;
    const seconds = side === "white" ? whiteSeconds : blackSeconds;
    const isUser = mode === "local" || side === playerSide;
    return (
      <div className={`play-player-bar ${turn === side && !terminal ? "is-active" : ""}`}>
        <div className="play-player-identity">
          <span className={`play-player-avatar ${isUser ? "is-user" : ""}`}>{isUser ? <Users size={19} /> : <Bot size={19} />}</span>
          <span><strong>{name}</strong><small>{detail}</small></span>
        </div>
        <div className="play-clock" aria-label={`${name} clock`}>{formatClock(seconds)}</div>
      </div>
    );
  }

  const statusText = resignedSide
    ? `${resignedSide === "white" ? whiteName : blackName} resigned · ${resignedSide === "white" ? blackName : whiteName} wins`
    : timedOut
      ? `${timedOut === "white" ? whiteName : blackName} ran out of time · ${timedOut === "white" ? blackName : whiteName} wins`
      : computerThinking
        ? "ChessIQ is thinking"
        : busy
          ? "Checking position"
          : engineTerminal
            ? statusLabel(status, turn)
            : mode === "computer" && turn !== playerSide
              ? status === "check" ? "ChessIQ to move · Check" : "ChessIQ to move"
              : mode === "computer"
                ? status === "check" ? "Your move · Check" : "Your move"
                : statusLabel(status, turn);

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell play-product-shell">
        <ProductHeader activePath="/play" />

        <header className="play-room-header">
          <div>
            <span className="premium-eyebrow">Play workspace</span>
            <h1>Play with purpose.</h1>
            <p>Every move stays legal, reviewable, and ready to carry into analysis.</p>
          </div>
          <div className="play-room-meta" aria-label="Game context">
            <span><Clock3 size={14} /> {timeControl.label}</span>
            <span><ShieldCheck size={14} /> First-party ChessEngine</span>
            <span>{mode === "computer" ? <Bot size={14} /> : <Users size={14} />} {mode === "computer" ? `${difficulty.label} · ${playerSide === "white" ? "White" : "Black"} vs ChessIQ` : "Local game"}</span>
          </div>
        </header>

        <section className="play-game-room play-layout" aria-label="Chess game room">
          <div className="play-board-stage">
            {renderPlayerBar(topSide)}

            <div className="play-board-card">
              <LegalChessBoard
                fen={fen}
                legalMoves={legalMoves}
                lastMove={lastMove}
                orientation={orientation}
                ariaLabel={`Playable chess board, ${orientation} orientation`}
                disabled={busy || computerThinking || terminal || (mode === "computer" && turn !== playerSide)}
                onMove={handleBoardMove}
              />
              {error && <p className="play-error" role="alert">{error}</p>}
            </div>

            {renderPlayerBar(bottomSide)}
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

            <div className="play-difficulty-section play-time-control-section">
              <div className="game-panel-heading"><span>Time control</span><Clock3 size={16} /></div>
              <div className="play-time-control-options" role="group" aria-label="Game time control">
                {PLAY_TIME_CONTROLS.map(control => (
                  <button
                    key={control.id}
                    type="button"
                    className={timeControl.id === control.id ? "is-active" : ""}
                    aria-pressed={timeControl.id === control.id}
                    disabled={busy || computerThinking}
                    onClick={() => selectTimeControl(control.id)}
                    title={`${control.detail} game — ${control.label} per side`}
                  >
                    <strong>{control.minutes}</strong>
                    <span>min</span>
                  </button>
                ))}
              </div>
              <p>{timeControl.detail} clock. Selecting a preset starts a fresh game and saves the choice on this device.</p>
            </div>

            {mode === "computer" && (
              <>
                <div className="play-difficulty-section">
                  <div className="game-panel-heading"><span>Play as</span><Swords size={16} /></div>
                  <div className="play-difficulty-options" role="group" aria-label="Choose your side">
                    {PLAY_SIDE_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        className={sidePreference === option.id ? "is-active" : ""}
                        aria-pressed={sidePreference === option.id}
                        disabled={busy || computerThinking}
                        onClick={() => selectSidePreference(option.id)}
                        title={option.detail}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.id === "random" ? "?" : option.id === "white" ? "W" : "B"}</span>
                      </button>
                    ))}
                  </div>
                  <p>{sidePreference === "random" ? `This game: ${playerSide === "white" ? "White" : "Black"}.` : `Board follows your ${playerSide} side.`} Choice is saved on this device.</p>
                </div>

                <div className="play-difficulty-section">
                  <div className="game-panel-heading"><span>Engine strength</span><Bot size={16} /></div>
                  <div className="play-difficulty-options" role="group" aria-label="ChessIQ engine strength">
                    {PLAY_DIFFICULTIES.map(level => (
                      <button
                        key={level.id}
                        type="button"
                        className={difficulty.id === level.id ? "is-active" : ""}
                        aria-pressed={difficulty.id === level.id}
                        disabled={computerThinking}
                        onClick={() => selectDifficulty(level.id)}
                      >
                        <strong>{level.label}</strong>
                        <span>D{level.depth}</span>
                      </button>
                    ))}
                  </div>
                  <p>{difficulty.detail}. Choice is saved on this device.</p>
                </div>
              </>
            )}

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
              <button type="button" onClick={undoMove} disabled={history.length <= 1 || busy || computerThinking || terminal}><ArrowLeft size={15} /> Undo</button>
              <button type="button" onClick={() => resetGame()} disabled={busy || computerThinking}><RotateCcw size={15} /> New game</button>
              <button type="button" className="play-resign-action" onClick={resignGame} disabled={!moves.length || busy || computerThinking || terminal}><Flag size={15} /> Resign</button>
            </div>
            <Link href={analysisHrefForFen(fen)} className="primary-action play-analyze-link">Open Analyze</Link>
            {timedOut && <div className="game-timeout-note"><Flag size={14} /> Time control: {timeControl.label}</div>}
          </aside>
        </section>
      </div>
    </main>
  );
}

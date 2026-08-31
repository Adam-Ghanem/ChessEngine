import { Bot, Plus, Save, ShieldCheck, Sparkles, Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PlayableChessBoard } from "@/components/PlayableChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";
import { gameSummary } from "@/lib/chessGame";

export default function PlayPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const games = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedGame = useMemo(
    () => games.data?.find(game => game.id === selectedId) ?? games.data?.find(game => game.status === "active") ?? games.data?.[0] ?? null,
    [games.data, selectedId],
  );

  useEffect(() => {
    if (selectedGame && selectedId !== selectedGame.id) setSelectedId(selectedGame.id);
  }, [selectedGame, selectedId]);

  const createGame = trpc.games.create.useMutation({
    onSuccess: async game => {
      setSelectedId(game.id);
      await utils.games.list.invalidate();
      toast("New board ready.");
    },
  });

  const moveGame = trpc.games.move.useMutation({
    onSuccess: async () => {
      await utils.games.list.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const summary = selectedGame ? gameSummary(selectedGame.initialFen, selectedGame.moves) : null;
  const status = summary?.isGameOver ? "Game complete" : summary ? `${summary.turn === "w" ? "White" : "Black"} to move` : "Create a game to begin";
  const modeLabel = selectedGame?.mode === "computer" ? "ChessEngine opponent" : "Local two-player board";

  return (
    <main className="app-shell chessiq-shell">
      <ProductHeader />

      <section className="product-page play-page">
        <header className="page-commandbar">
          <div>
            <p className="eyebrow">ChessIQ Play</p>
            <h1>Your board. Every move stays connected.</h1>
            <p>Play legal chess, keep the complete position history, and move straight into analysis when the game matters.</p>
          </div>
          <div className="page-status-chip" aria-live="polite">
            <span className="workspace-state-dot" />
            {isAuthenticated ? "Saved workspace" : "Sign in to save games"}
          </div>
        </header>

        {!isAuthenticated ? (
          <section className="auth-gate premium-auth-gate">
            <Swords size={28} />
            <p className="eyebrow">Persistent play</p>
            <h2>Sign in to keep every position.</h2>
            <p>Your games stay private to your account and remain available for ChessEngine analysis, lessons, and progress tracking.</p>
            <button className="account-button account-primary" onClick={() => startLogin()}>
              Sign in to start
            </button>
          </section>
        ) : (
          <div className="play-cockpit">
            <section className="board-cockpit" aria-label="Chess game board">
              {selectedGame && summary ? (
                <>
                  <div className="board-session-strip">
                    <div>
                      <span className="session-kicker">Current game</span>
                      <strong>{selectedGame.title}</strong>
                    </div>
                    <div className="session-state">
                      <span className="workspace-state-dot" />
                      <strong>{status}</strong>
                      <small>{modeLabel}</small>
                    </div>
                  </div>

                  <div className="board-canvas">
                    <PlayableChessBoard
                      fen={summary.fen}
                      disabled={moveGame.isPending || selectedGame.status !== "active"}
                      onMove={move => moveGame.mutate({ gameId: selectedGame.id, ...move })}
                    />
                  </div>

                  <div className="board-command-footer">
                    <span>
                      <ShieldCheck size={14} /> Legal moves validated
                    </span>
                    <span>{selectedGame.moves.length} ply saved</span>
                  </div>
                </>
              ) : (
                <div className="empty-panel board-empty-state">
                  <Save size={24} />
                  <h2>No active board yet.</h2>
                  <p>Create a board from the control rail to make your first move.</p>
                </div>
              )}
            </section>

            <aside className="play-control-rail" aria-label="Game controls">
              <section className="rail-section rail-new-game">
                <div className="rail-section-heading">
                  <div>
                    <p className="eyebrow">Game setup</p>
                    <h2>New game</h2>
                  </div>
                  <Plus size={18} />
                </div>
                <p>Choose a board mode. Every legal move is validated before it is saved.</p>
                <div className="game-mode-grid">
                  <button
                    className="game-mode-card"
                    disabled={createGame.isPending}
                    onClick={() => createGame.mutate({ title: "Local game", mode: "local" })}
                  >
                    <Swords size={19} />
                    <span>
                      <strong>Local board</strong>
                      <small>Two players, one board</small>
                    </span>
                  </button>
                  <button
                    className="game-mode-card game-mode-engine"
                    disabled={createGame.isPending}
                    onClick={() => createGame.mutate({ title: "Game vs ChessIQ", mode: "computer" })}
                  >
                    <Bot size={19} />
                    <span>
                      <strong>Play ChessEngine</strong>
                      <small>First-party engine response</small>
                    </span>
                  </button>
                </div>
              </section>

              <section className="rail-section recent-games-section">
                <div className="rail-section-heading">
                  <div>
                    <p className="eyebrow">History</p>
                    <h2>Recent games</h2>
                  </div>
                  <Sparkles size={17} />
                </div>
                <div className="saved-game-list premium-game-list">
                  {games.isLoading ? (
                    <span className="rail-muted">Loading your games…</span>
                  ) : games.data?.length ? (
                    games.data.slice(0, 6).map(game => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedId(game.id)}
                        className={selectedGame?.id === game.id ? "is-active" : ""}
                      >
                        <strong>{game.title}</strong>
                        <small>{game.mode === "computer" ? "vs ChessEngine" : "local"} · {game.status}</small>
                      </button>
                    ))
                  ) : (
                    <span className="rail-muted">Your saved games will appear here.</span>
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

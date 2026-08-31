import { Activity, BrainCircuit, FileUp, Gauge, History, PlayCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PlayableChessBoard } from "@/components/PlayableChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";
import { gameSummary } from "@/lib/chessGame";

function formatEngineScore(scoreCp: number) {
  if (Math.abs(scoreCp) >= 10_000) return scoreCp > 0 ? "Mating" : "Under mate pressure";
  return `${scoreCp > 0 ? "+" : ""}${(scoreCp / 100).toFixed(2)}`;
}

export default function AnalyzePage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const games = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(
    () => games.data?.find(game => game.id === selectedId) ?? games.data?.[0] ?? null,
    [games.data, selectedId],
  );

  useEffect(() => {
    if (selected && selectedId !== selected.id) setSelectedId(selected.id);
  }, [selected, selectedId]);

  const summary = selected ? gameSummary(selected.initialFen, selected.moves) : null;
  const analyses = trpc.analysis.list.useQuery(selected ? { gameId: selected.id } : undefined, { enabled: Boolean(selected) });
  const latestAnalysis = analyses.data?.[0] ?? null;

  const analyze = trpc.analysis.analyze.useMutation({
    onSuccess: async () => {
      await utils.analysis.list.invalidate();
      toast("ChessEngine analysis saved.");
    },
    onError: error => toast.error(error.message),
  });

  const [pgn, setPgn] = useState("");
  const importPgn = trpc.games.importPgn.useMutation({
    onSuccess: async game => {
      await utils.games.list.invalidate();
      setSelectedId(game.id);
      setPgn("");
      toast("PGN imported and ready for analysis.");
    },
    onError: error => toast.error(error.message),
  });

  return (
    <main className="app-shell chessiq-shell">
      <ProductHeader />

      <section className="product-page analyze-page">
        <header className="page-commandbar">
          <div>
            <p className="eyebrow">ChessIQ Analyze</p>
            <h1>See what the position is asking for.</h1>
            <p>Run the first-party ChessEngine on a saved position, keep every search session, and read the best move and principal variation in one focused workspace.</p>
          </div>
          <div className="page-status-chip" aria-live="polite">
            <span className="workspace-state-dot" />
            {analyze.isPending ? "ChessEngine calculating" : latestAnalysis ? "Analysis ready" : "Engine ready"}
          </div>
        </header>

        {!isAuthenticated ? (
          <section className="auth-gate premium-auth-gate">
            <BrainCircuit size={28} />
            <p className="eyebrow">Private analysis</p>
            <h2>Sign in to analyze your games.</h2>
            <p>Saved games and engine sessions stay attached to your account so you can return to the exact position later.</p>
            <button className="account-button account-primary" onClick={() => startLogin()}>
              Sign in to analyze
            </button>
          </section>
        ) : (
          <>
            <div className="analysis-cockpit">
              <section className="analysis-board-stage" aria-label="Position under analysis">
                {selected && summary ? (
                  <>
                    <div className="analysis-position-strip">
                      <div>
                        <span className="session-kicker">Selected game</span>
                        <strong>{selected.title}</strong>
                      </div>
                      <div className="analysis-position-meta">
                        <span>{selected.moves.length} ply</span>
                        <span>•</span>
                        <span>{summary.turn === "w" ? "White" : "Black"} to move</span>
                      </div>
                    </div>

                    <div className="analysis-board-canvas">
                      <PlayableChessBoard fen={summary.fen} disabled onMove={() => undefined} />
                    </div>

                    <div className="analysis-board-actions">
                      <div>
                        <span className="session-kicker">Current position</span>
                        <code>{summary.fen}</code>
                      </div>
                      <button
                        className="product-action product-action-violet engine-primary-action"
                        disabled={analyze.isPending}
                        onClick={() => analyze.mutate({ fen: summary.fen, gameId: selected.id, depth: 6 })}
                      >
                        <PlayCircle size={16} />
                        {analyze.isPending ? "Calculating…" : "Analyze with ChessEngine"}
                      </button>
                    </div>

                    {analyze.error && <p className="analysis-inline-error" role="alert">{analyze.error.message}</p>}
                  </>
                ) : (
                  <div className="empty-panel board-empty-state">
                    <BrainCircuit size={24} />
                    <h2>No game selected.</h2>
                    <p>Play a game or import a PGN, then return here to analyze a real saved position.</p>
                  </div>
                )}
              </section>

              <aside className="analysis-insight-rail" aria-label="Engine insights">
                <section className="engine-analysis-card">
                  <div className="rail-section-heading">
                    <div>
                      <p className="eyebrow">ChessEngine</p>
                      <h2>Engine analysis</h2>
                    </div>
                    <Gauge size={18} />
                  </div>

                  {analyze.isPending ? (
                    <div className="engine-thinking-state" aria-live="polite">
                      <span className="workspace-state-dot" />
                      <div>
                        <strong>Searching the position</strong>
                        <small>Depth 6 target · first-party ChessEngine</small>
                      </div>
                    </div>
                  ) : latestAnalysis ? (
                    <div className="engine-result">
                      <div className="engine-score-grid">
                        <div>
                          <span>Score</span>
                          <strong>{formatEngineScore(latestAnalysis.scoreCp)}</strong>
                        </div>
                        <div>
                          <span>Depth</span>
                          <strong>{latestAnalysis.depth}</strong>
                        </div>
                      </div>
                      <div className="best-move-block">
                        <span>Best move</span>
                        <strong>{latestAnalysis.bestMove}</strong>
                      </div>
                      <div className="principal-variation-block">
                        <span>Principal variation</span>
                        <code>{latestAnalysis.principalVariation || "No principal variation returned"}</code>
                      </div>
                      <div className="engine-source-line">
                        <Activity size={13} />
                        {latestAnalysis.engine}
                      </div>
                    </div>
                  ) : (
                    <div className="engine-empty-state">
                      <BrainCircuit size={21} />
                      <strong>No saved analysis yet.</strong>
                      <p>Run ChessEngine on the current board to create the first session.</p>
                    </div>
                  )}
                </section>

                <section className="rail-section analysis-history-section">
                  <div className="rail-section-heading">
                    <div>
                      <p className="eyebrow">Search history</p>
                      <h2>Engine sessions</h2>
                    </div>
                    <History size={17} />
                  </div>
                  {analyses.isLoading ? (
                    <p className="rail-muted">Loading sessions…</p>
                  ) : analyses.data?.length ? (
                    <div className="analysis-session-list premium-analysis-list">
                      {analyses.data.slice(0, 8).map(item => (
                        <article key={item.id}>
                          <div>
                            <strong>{item.bestMove}</strong>
                            <span>{formatEngineScore(item.scoreCp)} · d{item.depth}</span>
                          </div>
                          <p>{item.principalVariation || "Principal variation unavailable"}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="rail-muted">No engine sessions for this game yet.</p>
                  )}
                </section>

                <section className="rail-section analysis-games-section">
                  <div className="rail-section-heading">
                    <div>
                      <p className="eyebrow">Library</p>
                      <h2>Your games</h2>
                    </div>
                    <FileUp size={17} />
                  </div>
                  <div className="saved-game-list premium-game-list">
                    {games.isLoading ? (
                      <span className="rail-muted">Loading your games…</span>
                    ) : games.data?.length ? (
                      games.data.slice(0, 8).map(game => (
                        <button
                          key={game.id}
                          className={selected?.id === game.id ? "is-active" : ""}
                          onClick={() => setSelectedId(game.id)}
                        >
                          <strong>{game.title}</strong>
                          <small>{game.moves.length} ply · {game.status}</small>
                        </button>
                      ))
                    ) : (
                      <span className="rail-muted">No saved games yet.</span>
                    )}
                  </div>
                </section>
              </aside>
            </div>

            <section className="analysis-import-panel" aria-labelledby="import-pgn-heading">
              <div className="import-copy">
                <Upload size={19} />
                <div>
                  <p className="eyebrow">Game intake</p>
                  <h2 id="import-pgn-heading">Import PGN</h2>
                  <p>Paste a completed or ongoing game. ChessIQ validates it, saves the position history, and makes it immediately selectable above.</p>
                </div>
              </div>
              <textarea
                value={pgn}
                onChange={event => setPgn(event.target.value)}
                placeholder="Paste PGN here"
                aria-label="PGN game text"
              />
              <button
                className="product-action import-pgn-action"
                disabled={!pgn.trim() || importPgn.isPending}
                onClick={() => importPgn.mutate({ title: "Imported game", pgn })}
              >
                <Upload size={15} />
                {importPgn.isPending ? "Importing…" : "Import game"}
              </button>
              {importPgn.error && <p className="analysis-inline-error import-error" role="alert">{importPgn.error.message}</p>}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

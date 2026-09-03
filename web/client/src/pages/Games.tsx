import { useState } from "react";
import { Clock3, Copy, Gamepad2, History, PlayCircle, Sparkles, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { analysisHrefForGame } from "@/lib/analysisRoute";
import { clearGameHistory, deleteGameHistory, isResumableGame, readGameHistory, type StoredGame } from "@/lib/gameHistory";
import { gameOutcomeLabel } from "@/lib/gameOutcome";
import "../games.css";

export default function Games() {
  const [games, setGames] = useState(() => readGameHistory());

  async function copyFen(fen: string) {
    try {
      await navigator.clipboard.writeText(fen);
      toast.success("FEN copied.");
    } catch {
      toast.error("Unable to copy FEN.");
    }
  }

  function deleteSavedGame(game: StoredGame) {
    if (!window.confirm("Delete this saved game from this device? This cannot be undone.")) return;
    deleteGameHistory(game.id);
    setGames(current => current.filter(item => item.id !== game.id));
    toast("Saved game deleted from this device.");
  }

  function clearHistory() {
    clearGameHistory();
    setGames([]);
    toast("Game history cleared on this device.");
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell games-product-shell">
        <ProductHeader activePath="/games" />

        <section className="games-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Games</div>
            <h1>Your real games, kept close.</h1>
            <p>ChessIQ stores games played on this device from the live Play board. No generated opponents, ratings, or fake history.</p>
          </div>
          <div className="games-summary" aria-label={`${games.length} saved games`}>
            <span>Saved on this device</span>
            <strong>{games.length}</strong>
            <small>Up to 20 recent games</small>
          </div>
        </section>

        {games.length ? (
          <>
            <div className="games-toolbar">
              <span><History size={16} /> Recent games</span>
              <button type="button" onClick={clearHistory}><Trash2 size={15} /> Clear history</button>
            </div>
            <section className="games-grid" aria-label="Saved games">
              {games.map(game => (
                <article className="game-history-card" key={game.id}>
                  <div className="game-history-card-top">
                    <span className="game-mode"><Gamepad2 size={15} /> {game.mode === "computer" ? "vs ChessIQ" : "Local board"}</span>
                    <span className={`game-status game-status-${game.termination ?? game.status}`}>{gameOutcomeLabel(game)}</span>
                  </div>
                  <strong>{game.moves.length} ply{game.moves.length === 1 ? "" : "s"}</strong>
                  <p>{game.moves.length ? game.moves.slice(-6).join(" · ") : "No recorded moves"}</p>
                  <div className="game-history-meta"><Clock3 size={14} /><time dateTime={game.updatedAt}>{new Date(game.updatedAt).toLocaleString()}</time></div>
                  <div className="game-history-actions">
                    <button type="button" onClick={() => copyFen(game.fen)}><Copy size={14} /> Copy FEN</button>
                    <button type="button" className="game-delete-action" onClick={() => deleteSavedGame(game)} aria-label={`Delete saved game from ${new Date(game.updatedAt).toLocaleString()}`}><Trash2 size={14} /> Delete</button>
                    {isResumableGame(game) && (
                      <Link href={`/play?resume=${encodeURIComponent(game.id)}`} className="primary-action"><PlayCircle size={14} /> Resume game</Link>
                    )}
                    <Link href={analysisHrefForGame(game.fen, game.id)} className="primary-action">Review in Analyze</Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <section className="games-empty" aria-labelledby="games-empty-title">
            <Gamepad2 size={28} />
            <h2 id="games-empty-title">No games saved yet.</h2>
            <p>Start a game against ChessIQ or use the local board. Your first move will create a private device-local record here.</p>
            <Link href="/play" className="primary-action">Start playing</Link>
          </section>
        )}

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Play. Review. Improve.</p>
          <span>Game history is stored only in this browser.</span>
        </footer>
      </div>
    </main>
  );
}

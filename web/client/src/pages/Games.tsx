import { useState } from "react";
import { Clock3, Copy, Gamepad2, History, Sparkles, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { analysisHrefForFen } from "@/lib/analysisRoute";
import { clearGameHistory, readGameHistory, type StoredGame } from "@/lib/gameHistory";
import "../games.css";

function statusCopy(game: StoredGame) {
  if (game.status === "checkmate") return "Checkmate";
  if (game.status === "stalemate") return "Stalemate";
  if (game.status === "draw") return "Draw";
  if (game.status === "check") return "In check";
  return "In progress";
}

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
                    <span className={`game-status game-status-${game.status}`}>{statusCopy(game)}</span>
                  </div>
                  <strong>{game.moves.length} ply{game.moves.length === 1 ? "" : "s"}</strong>
                  <p>{game.moves.length ? game.moves.slice(-6).join(" · ") : "No recorded moves"}</p>
                  <div className="game-history-meta"><Clock3 size={14} /><time dateTime={game.updatedAt}>{new Date(game.updatedAt).toLocaleString()}</time></div>
                  <div className="game-history-actions">
                    <button type="button" onClick={() => copyFen(game.fen)}><Copy size={14} /> Copy FEN</button>
                    <Link href={analysisHrefForFen(game.fen)} className="primary-action">Analyze position</Link>
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

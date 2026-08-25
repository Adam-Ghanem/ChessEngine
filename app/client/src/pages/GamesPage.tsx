import { Download, FileClock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";

function downloadPgn(title: string, pgn: string) { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([pgn || ""], { type: "application/x-chess-pgn" })); link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "chessiq-game"}.pgn`; link.click(); URL.revokeObjectURL(link.href); }

export default function GamesPage() {
  const { isAuthenticated } = useAuth();
  const games = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated });
  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page"><div className="product-intro"><p className="eyebrow">ChessIQ games</p><h1>Your positions stay yours.</h1><p>Every saved game can return to Play, become an analysis session, or be exported as standard PGN.</p></div>{!isAuthenticated ? <section className="auth-gate"><FileClock size={28}/><h2>Sign in to see your game archive.</h2><button className="account-button account-primary" onClick={() => startLogin()}>Sign in</button></section> : <section className="archive-list">{games.isLoading ? <p>Loading games…</p> : games.data?.length ? games.data.map(game => <article key={game.id}><div><span>{game.mode} · {game.status}</span><h2>{game.title}</h2><p>{game.moves.length} ply · updated {new Date(game.updatedAt).toLocaleDateString()}</p></div><button className="product-action" onClick={() => downloadPgn(game.title, game.pgn)}><Download size={15}/>Export PGN</button></article>) : <div className="empty-panel"><p>No saved games. Start one from Play or import a PGN in Analyze.</p></div>}</section>}</section></main>;
}

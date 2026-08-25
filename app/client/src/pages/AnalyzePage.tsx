import { BrainCircuit, History, PlayCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PlayableChessBoard } from "@/components/PlayableChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";
import { gameSummary } from "@/lib/chessGame";

export default function AnalyzePage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const games = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(() => games.data?.find(game => game.id === selectedId) ?? games.data?.[0] ?? null, [games.data, selectedId]);
  useEffect(() => { if (selected && selectedId !== selected.id) setSelectedId(selected.id); }, [selected, selectedId]);
  const summary = selected ? gameSummary(selected.initialFen, selected.moves) : null;
  const analyses = trpc.analysis.list.useQuery(selected ? { gameId: selected.id } : undefined, { enabled: Boolean(selected) });
  const analyze = trpc.analysis.analyze.useMutation({ onSuccess: async () => { await utils.analysis.list.invalidate(); toast("ChessEngine analysis saved."); }, onError: error => toast.error(error.message) });
  const [pgn, setPgn] = useState("");
  const importPgn = trpc.games.importPgn.useMutation({ onSuccess: async game => { await utils.games.list.invalidate(); setSelectedId(game.id); setPgn(""); toast("PGN imported and ready for analysis."); }, onError: error => toast.error(error.message) });
  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page analyze-layout"><div className="product-intro"><p className="eyebrow">ChessIQ analysis</p><h1>Ask the engine about a real saved position.</h1><p>Each search is attached to your game, with its FEN, principal variation, depth, and score retained for later review.</p></div>
    {!isAuthenticated ? <section className="auth-gate"><BrainCircuit size={28}/><h2>Sign in to analyze real games.</h2><p>Analysis sessions are private to your account and connected to your saved game history.</p><button className="account-button account-primary" onClick={() => startLogin()}>Sign in to analyze</button></section> : <div className="analysis-product-grid"><section className="play-stage">{selected && summary ? <><div className="play-status"><strong>{selected.title}</strong><span>{selected.moves.length} ply</span></div><PlayableChessBoard fen={summary.fen} disabled onMove={() => undefined} /><button className="product-action product-action-violet engine-action" disabled={analyze.isPending} onClick={() => analyze.mutate({ fen: summary.fen, gameId: selected.id, depth: 6 })}>{analyze.isPending ? "Calculating…" : <><PlayCircle size={16}/>Analyze with ChessEngine</>}</button></> : <div className="empty-panel"><BrainCircuit size={24}/><p>Play or import a game before running analysis.</p></div>}</section>
      <aside className="product-sidebar"><h2>Engine sessions</h2>{analyses.isLoading ? <p>Loading sessions…</p> : analyses.data?.length ? <div className="analysis-session-list">{analyses.data.map(item => <article key={item.id}><strong>{item.bestMove}</strong><span>{item.scoreCp > 0 ? "+" : ""}{(item.scoreCp / 100).toFixed(2)} · d{item.depth}</span><p>{item.principalVariation || "Principal variation unavailable"}</p></article>)}</div> : <p>No analysis saved for this game yet.</p>}<h2 className="sidebar-heading">Your games</h2><div className="saved-game-list">{games.data?.map(game => <button key={game.id} className={selected?.id === game.id ? "is-active" : ""} onClick={() => setSelectedId(game.id)}><strong>{game.title}</strong><small>{game.moves.length} ply · {game.status}</small></button>)}</div></aside>
    </div>}
    {isAuthenticated && <section className="pgn-import"><Upload size={18}/><div><h2>Import PGN</h2><p>Load one completed or ongoing game into your private ChessIQ history.</p></div><textarea value={pgn} onChange={event => setPgn(event.target.value)} placeholder="Paste PGN here" /><button className="product-action" disabled={!pgn.trim() || importPgn.isPending} onClick={() => importPgn.mutate({ title: "Imported game", pgn })}>Import game</button></section>}
  </section></main>;
}

import { Bot, Plus, Save, Swords } from "lucide-react";
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
  const selectedGame = useMemo(() => games.data?.find(game => game.id === selectedId) ?? games.data?.find(game => game.status === "active") ?? games.data?.[0] ?? null, [games.data, selectedId]);
  useEffect(() => { if (selectedGame && selectedId !== selectedGame.id) setSelectedId(selectedGame.id); }, [selectedGame, selectedId]);
  const createGame = trpc.games.create.useMutation({ onSuccess: async game => { setSelectedId(game.id); await utils.games.list.invalidate(); toast("New board ready."); } });
  const moveGame = trpc.games.move.useMutation({ onSuccess: async () => { await utils.games.list.invalidate(); }, onError: error => toast.error(error.message) });
  const summary = selectedGame ? gameSummary(selectedGame.initialFen, selectedGame.moves) : null;
  const status = summary?.isGameOver ? "Game complete" : summary ? `${summary.turn === "w" ? "White" : "Black"} to move` : "Create a game to begin";

  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page play-layout">
    <div className="product-intro"><p className="eyebrow">ChessIQ play</p><h1>Play a legal game. Keep every position.</h1><p>Start a local board or play against the integrated ChessEngine response. Your moves, FEN, and PGN are saved to your account.</p></div>
    {!isAuthenticated ? <section className="auth-gate"><Swords size={28}/><h2>Sign in to play for real.</h2><p>ChessIQ saves your games and makes them available for analysis, lessons, and progress tracking.</p><button className="account-button account-primary" onClick={() => startLogin()}>Sign in to start</button></section> : <div className="play-workspace">
      <section className="play-stage">{selectedGame && summary ? <><div className="play-status"><span className="workspace-state-dot" />{status}<span>•</span><strong>{selectedGame.title}</strong></div><PlayableChessBoard fen={summary.fen} disabled={moveGame.isPending || selectedGame.status !== "active"} onMove={move => moveGame.mutate({ gameId: selectedGame.id, ...move })} /><div className="play-footer"><span>{selectedGame.mode === "computer" ? "Computer response enabled" : "Local two-player board"}</span><span>{selectedGame.moves.length} ply saved</span></div></> : <div className="empty-panel"><Save size={24}/><p>Create your first saved game.</p></div>}</section>
      <aside className="product-sidebar"><h2>New game</h2><p>Choose how this board should behave. Every legal move is validated before it is saved.</p><button className="product-action" disabled={createGame.isPending} onClick={() => createGame.mutate({ title: "Local game", mode: "local" })}><Plus size={16}/>Local board</button><button className="product-action product-action-teal" disabled={createGame.isPending} onClick={() => createGame.mutate({ title: "Game vs ChessIQ", mode: "computer" })}><Bot size={16}/>Play ChessEngine</button><h2 className="sidebar-heading">Recent games</h2><div className="saved-game-list">{games.isLoading ? <span>Loading your games…</span> : games.data?.length ? games.data.slice(0, 6).map(game => <button key={game.id} onClick={() => setSelectedId(game.id)} className={selectedGame?.id === game.id ? "is-active" : ""}><strong>{game.title}</strong><small>{game.mode} · {game.status}</small></button>) : <span>No games yet.</span>}</div></aside>
    </div>}</section></main>;
}

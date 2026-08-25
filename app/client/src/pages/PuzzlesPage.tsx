import { Lightbulb, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PlayableChessBoard } from "@/components/PlayableChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";

export default function PuzzlesPage() {
  const { isAuthenticated } = useAuth();
  const catalog = trpc.puzzles.catalog.useQuery();
  const [index, setIndex] = useState(0);
  const puzzle = catalog.data?.[index] ?? null;
  const [attempt, setAttempt] = useState<string[]>([]);
  const utils = trpc.useUtils();
  const submit = trpc.puzzles.submit.useMutation({ onSuccess: async result => { await utils.puzzles.attempts.invalidate(); toast(result.result === "solved" ? "Puzzle solved and saved." : "Not quite — review the position and try again."); }, onError: error => toast.error(error.message) });
  const onMove = (move: { from: string; to: string; promotion?: "q" | "r" | "b" | "n" }) => setAttempt(current => [...current, `${move.from}${move.to}${move.promotion ?? ""}`]);
  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page"><div className="product-intro"><p className="eyebrow">ChessIQ puzzles</p><h1>Calculate first. Reveal nothing.</h1><p>Attempt a focused tactical task, then save the result to build a true picture of your practice.</p></div>{puzzle && <div className="puzzle-layout"><section className="play-stage"><div className="play-status"><span>{puzzle.difficulty}</span><strong>{puzzle.title}</strong><span>{puzzle.themes.join(" · ")}</span></div><PlayableChessBoard key={`${puzzle.key}-${attempt.length}`} fen={puzzle.fen} onMove={onMove} /><div className="puzzle-actions"><button className="product-action" onClick={() => setAttempt([])}><RotateCcw size={15}/>Reset</button>{isAuthenticated ? <button className="product-action product-action-violet" disabled={!attempt.length || submit.isPending} onClick={() => submit.mutate({ puzzleKey: puzzle.key, moves: attempt })}><Lightbulb size={15}/>Check line</button> : <button className="product-action product-action-violet" onClick={() => startLogin()}>Sign in to record attempt</button>}</div></section><aside className="product-sidebar"><h2>Puzzle queue</h2><div className="saved-game-list">{catalog.data?.map((item, itemIndex) => <button key={item.key} className={itemIndex === index ? "is-active" : ""} onClick={() => { setIndex(itemIndex); setAttempt([]); }}><strong>{item.title}</strong><small>{item.difficulty}</small></button>)}</div><p className="sidebar-note">Your move is checked against the curated solution and the result is saved only to your own profile.</p></aside></div>}</section></main>;
}

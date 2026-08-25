import { BookOpenCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";

export default function LearnPage() {
  const { isAuthenticated } = useAuth();
  const lessons = trpc.learn.catalog.useQuery();
  const progress = trpc.learn.progress.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const save = trpc.learn.saveProgress.useMutation({ onSuccess: async () => { await utils.learn.progress.invalidate(); toast("Learning progress saved."); } });
  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page"><div className="product-intro"><p className="eyebrow">ChessIQ learn</p><h1>Turn engine concepts into habits.</h1><p>Each short path saves your checkpoints, so the next session starts with the right idea rather than a blank board.</p></div><div className="learning-grid">{lessons.data?.map(lesson => { const item = progress.data?.find(entry => entry.lessonKey === lesson.key); const completed = item?.status === "completed"; return <article key={lesson.key} className="learning-card"><BookOpenCheck size={22}/><span>{lesson.difficulty}</span><h2>{lesson.title}</h2><p>{lesson.summary}</p><small>{item?.completedSteps ?? 0}/{lesson.steps} checkpoints saved</small>{isAuthenticated ? <button className="product-action" disabled={save.isPending || completed} onClick={() => save.mutate({ lessonKey: lesson.key, status: completed ? "completed" : "completed", completedSteps: lesson.steps })}>{completed ? <><CheckCircle2 size={15}/>Completed</> : "Complete lesson"}</button> : <button className="product-action" onClick={() => startLogin()}>Sign in to save progress</button>}</article>; })}</div></section></main>;
}

import { BookOpenCheck, CircleDot, Layers3, ShieldCheck } from "lucide-react";

export function TrainerSessionRail({
  openingName,
  eco,
  side,
  mode,
  index,
  total,
  queueCount,
}: {
  openingName: string;
  eco: string;
  side: "white" | "black";
  mode: "learn" | "recall" | "mixed";
  index: number;
  total: number;
  queueCount?: number;
}) {
  const percent = total ? Math.round((Math.min(index, total) / total) * 100) : 0;
  return (
    <aside className="trainer-session-rail opening-panel" aria-label="Opening trainer session status">
      <div className="opening-panel-title"><Layers3 size={16}/><span>Session</span></div>
      <div className="trainer-session-block"><span>Opening</span><strong>{eco}</strong><p>{openingName}</p></div>
      <div className="trainer-session-grid">
        <div><CircleDot size={14}/><span>Side</span><strong>{side === "white" ? "White" : "Black"}</strong></div>
        <div><BookOpenCheck size={14}/><span>Mode</span><strong>{mode}</strong></div>
        <div><ShieldCheck size={14}/><span>Question</span><strong>{Math.min(index + 1, Math.max(total, 1))}/{Math.max(total, 1)}</strong></div>
      </div>
      <div className="trainer-progress-track" aria-label={`${percent}% of current session complete`}><i style={{ width: `${percent}%` }}/></div>
      {typeof queueCount === "number" ? <p className="trainer-queue-note">{queueCount} saved review line{queueCount === 1 ? "" : "s"} available.</p> : null}
    </aside>
  );
}

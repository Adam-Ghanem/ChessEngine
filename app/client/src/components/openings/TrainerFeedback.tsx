import { AlertTriangle, CheckCircle2, CloudOff, RotateCcw, Sparkles } from "lucide-react";
import type { TrainerMoveResult } from "@/lib/openings/trainer";

export type TrainerRating = "again" | "hard" | "good" | "easy";

export function TrainerFeedback({
  result,
  explanation,
  canonicalMove,
  syncState,
  onRate,
  disabled,
}: {
  result: TrainerMoveResult | null;
  explanation?: string;
  canonicalMove?: string;
  syncState: "idle" | "saving" | "synced" | "not-synced";
  onRate: (rating: TrainerRating) => void;
  disabled?: boolean;
}) {
  if (!result) return <section className="trainer-feedback is-waiting"><Sparkles size={18}/><p>Find the repertoire move on the board.</p></section>;
  if (result.kind === "illegal") return <section className="trainer-feedback is-illegal"><AlertTriangle size={18}/><div><strong>Illegal move</strong><p>That piece cannot move there in this position. Try again.</p></div></section>;

  const positive = result.kind === "correct" || result.kind === "acceptable";
  return (
    <section className={`trainer-feedback ${positive ? "is-positive" : "is-wrong"}`} aria-live="polite">
      <div className="trainer-feedback-head">
        {positive ? <CheckCircle2 size={19}/> : <RotateCcw size={19}/>} 
        <div><strong>{result.kind === "correct" ? "Main repertoire move" : result.kind === "acceptable" ? "Accepted repertoire alternative" : "Legal, but outside this repertoire"}</strong><p>{explanation}</p></div>
      </div>
      {canonicalMove ? <div className="trainer-canonical-move"><span>Canonical move</span><code>{canonicalMove}</code></div> : null}
      <div className="trainer-rating-row" aria-label="Rate this opening recall">
        {(["again", "hard", "good", "easy"] as const).map(rating => <button key={rating} type="button" disabled={disabled} onClick={() => onRate(rating)} className={`is-${rating}`}>{rating === "again" ? "Again" : rating[0].toUpperCase() + rating.slice(1)}</button>)}
      </div>
      <div className={`trainer-sync-state is-${syncState}`}>{syncState === "saving" ? "Saving…" : syncState === "synced" ? "Synced" : syncState === "not-synced" ? <><CloudOff size={13}/> Not synced — session kept locally</> : ""}</div>
    </section>
  );
}

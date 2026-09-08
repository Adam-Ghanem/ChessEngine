import { CheckCircle2, Eye, RotateCcw, XCircle } from "lucide-react";
import type { OpeningLessonStep } from "@shared/learning/openings";

export type LessonCheckpointStatus = "idle" | "illegal" | "wrong" | "correct";

type LessonCheckpointProps = {
  step: OpeningLessonStep;
  status: LessonCheckpointStatus;
  message: string | null;
  revealAnswer: boolean;
  onReveal: () => void;
  onRetry: () => void;
};

export function LessonCheckpoint({ step, status, message, revealAnswer, onReveal, onRetry }: LessonCheckpointProps) {
  if (step.kind !== "checkpoint") return null;
  return (
    <section className={`lesson-checkpoint is-${status}`} aria-live="polite">
      <div className="lesson-checkpoint-heading">
        <span>Interactive checkpoint</span>
        <strong>Play your answer on the board.</strong>
      </div>
      {status === "idle" ? <p>Choose a legal move that matches the plan described above.</p> : null}
      {status === "correct" ? <p><CheckCircle2 size={16} aria-hidden="true" />{message ?? step.feedback?.correct}</p> : null}
      {status === "wrong" || status === "illegal" ? <p><XCircle size={16} aria-hidden="true" />{message ?? step.feedback?.incorrect}</p> : null}
      <div className="lesson-checkpoint-actions">
        {status === "wrong" || status === "illegal" ? <button type="button" onClick={onRetry}><RotateCcw size={13} aria-hidden="true" /> Retry</button> : null}
        {status !== "correct" && !revealAnswer ? <button type="button" onClick={onReveal}><Eye size={13} aria-hidden="true" /> Reveal idea</button> : null}
      </div>
      {revealAnswer ? <div className="lesson-answer-reveal"><span>Course move</span><strong>{step.acceptedMoves?.[0] ?? "See the board cue"}</strong></div> : null}
    </section>
  );
}

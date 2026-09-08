import { AlertTriangle, BrainCircuit, Lightbulb, Route, ShieldAlert, Target } from "lucide-react";
import type { OpeningLessonStep } from "@shared/learning/openings";

const POINT_LABELS: Record<string, string> = {
  plan: "Plan",
  mistake: "Common mistake",
  trap: "Tactical warning",
  "pawn-structure": "Pawn structure",
  "key-square": "Key squares",
  "thematic-break": "Thematic break",
};

function pointIcon(point?: string) {
  if (point === "mistake") return <AlertTriangle size={16} aria-hidden="true" />;
  if (point === "trap") return <ShieldAlert size={16} aria-hidden="true" />;
  if (point === "thematic-break") return <Route size={16} aria-hidden="true" />;
  if (point === "key-square") return <Target size={16} aria-hidden="true" />;
  if (point === "pawn-structure") return <BrainCircuit size={16} aria-hidden="true" />;
  return <Lightbulb size={16} aria-hidden="true" />;
}

type LessonExplanationProps = {
  step: OpeningLessonStep;
};

export function LessonExplanation({ step }: LessonExplanationProps) {
  return (
    <section className="lesson-explanation" aria-labelledby="lesson-step-title">
      <div className="lesson-explanation-kicker">
        {pointIcon(step.learningPoint)}
        <span>{step.learningPoint ? POINT_LABELS[step.learningPoint] ?? step.learningPoint : step.kind}</span>
      </div>
      <h2 id="lesson-step-title">{step.title}</h2>
      <p>{step.body}</p>
      {step.annotations?.length ? (
        <div className="lesson-concept-list" aria-label="Visual concepts on the board">
          {step.annotations.map((annotation, index) => (
            <span key={`${annotation.kind}-${index}`}><i aria-hidden="true" />{annotation.label}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

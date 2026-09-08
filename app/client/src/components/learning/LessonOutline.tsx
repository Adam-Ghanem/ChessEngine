import { Check, Circle, Play } from "lucide-react";
import type { OpeningLesson } from "@shared/learning/openings";

type LessonOutlineProps = {
  lesson: OpeningLesson;
  activeIndex: number;
  completedSteps: number;
  onSelect: (index: number) => void;
};

export function LessonOutline({ lesson, activeIndex, completedSteps, onSelect }: LessonOutlineProps) {
  let offset = 0;
  return (
    <nav className="lesson-outline" aria-label="Course outline">
      <div className="lesson-outline-heading">
        <span>Course outline</span>
        <strong>{completedSteps} steps saved</strong>
      </div>
      {lesson.chapters.map((chapter, chapterIndex) => {
        const chapterOffset = offset;
        offset += chapter.steps.length;
        return (
          <section key={chapter.id} className="lesson-outline-chapter">
            <div className="lesson-outline-chapter-title">
              <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
              <div><strong>{chapter.title}</strong><small>{chapter.objective}</small></div>
            </div>
            <div className="lesson-outline-steps">
              {chapter.steps.map((step, stepIndex) => {
                const globalIndex = chapterOffset + stepIndex;
                const complete = globalIndex < completedSteps;
                const active = globalIndex === activeIndex;
                return (
                  <button
                    type="button"
                    key={`${chapter.id}-${step.id}`}
                    className={`${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
                    aria-current={active ? "step" : undefined}
                    onClick={() => onSelect(globalIndex)}
                  >
                    {complete ? <Check size={12} aria-hidden="true" /> : active ? <Play size={11} aria-hidden="true" /> : <Circle size={9} aria-hidden="true" />}
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </nav>
  );
}

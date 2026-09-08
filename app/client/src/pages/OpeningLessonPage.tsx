import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Compass, FlipHorizontal2, Save, Target } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ProductHeader } from "@/components/ProductHeader";
import { LessonCheckpoint, type LessonCheckpointStatus } from "@/components/learning/LessonCheckpoint";
import { LessonExplanation } from "@/components/learning/LessonExplanation";
import { LessonOutline } from "@/components/learning/LessonOutline";
import { OpeningBoardWorkspace } from "@/components/openings/OpeningBoardWorkspace";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { evaluateLessonMove, flattenLessonSteps, getLessonStepPosition, resumeLessonIndex } from "@shared/learning/openings/runtime";

export default function OpeningLessonPage() {
  const { lessonSlug = "" } = useParams<{ lessonSlug: string }>();
  const { isAuthenticated } = useAuth();
  const lessonQuery = trpc.learn.openingLesson.useQuery({ slug: lessonSlug }, { enabled: Boolean(lessonSlug) });
  const progress = trpc.learn.progress.useQuery(undefined, { enabled: isAuthenticated });
  const saveProgress = trpc.learn.saveProgress.useMutation();
  const utils = trpc.useUtils();
  const lesson = lessonQuery.data;
  const steps = useMemo(() => lesson ? flattenLessonSteps(lesson) : [], [lesson]);
  const initializedKey = useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [savedCompletedSteps, setSavedCompletedSteps] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [checkpointStatus, setCheckpointStatus] = useState<LessonCheckpointStatus>("idle");
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [notSynced, setNotSynced] = useState(false);

  useEffect(() => {
    initializedKey.current = null;
    setActiveIndex(0);
    setCompletedSteps(0);
    setSavedCompletedSteps(0);
    setCheckpointStatus("idle");
    setCheckpointMessage(null);
    setRevealAnswer(false);
    setNotSynced(false);
  }, [lessonSlug]);

  useEffect(() => {
    if (!lesson) return;
    if (isAuthenticated && progress.isLoading) return;
    if (initializedKey.current === lesson.key) return;
    const item = progress.data?.find(entry => entry.lessonKey === lesson.key);
    const restored = item?.completedSteps ?? 0;
    setCompletedSteps(restored);
    setSavedCompletedSteps(restored);
    setActiveIndex(resumeLessonIndex(lesson, restored));
    setOrientation(lesson.sideFocus === "black" ? "black" : "white");
    initializedKey.current = lesson.key;
  }, [isAuthenticated, lesson, progress.data, progress.isLoading]);

  useEffect(() => {
    setCheckpointStatus("idle");
    setCheckpointMessage(null);
    setRevealAnswer(false);
  }, [activeIndex]);

  const currentStep = steps[activeIndex];
  const position = useMemo(() => currentStep ? getLessonStepPosition(currentStep) : null, [currentStep]);
  const percent = steps.length ? Math.min(100, Math.round((completedSteps / steps.length) * 100)) : 0;

  const persistCompletedSteps = async (wanted: number) => {
    if (!lesson) return;
    const nextCompleted = Math.min(steps.length, Math.max(completedSteps, wanted));
    if (nextCompleted > completedSteps) setCompletedSteps(nextCompleted);
    if (!isAuthenticated || nextCompleted <= savedCompletedSteps) return;
    try {
      await saveProgress.mutateAsync({
        lessonKey: lesson.key,
        status: nextCompleted >= steps.length ? "completed" : "in_progress",
        completedSteps: nextCompleted,
      });
      setSavedCompletedSteps(nextCompleted);
      setNotSynced(false);
      await utils.learn.progress.invalidate();
    } catch {
      setNotSynced(true);
    }
  };

  const handleLessonMove = (uci: string) => {
    if (!currentStep || currentStep.kind !== "checkpoint") return;
    const evaluation = evaluateLessonMove(currentStep, uci);
    if (evaluation.kind === "illegal") {
      setCheckpointStatus("illegal");
      setCheckpointMessage("That move is illegal in this position. Choose a legal move and try again.");
      return;
    }
    if (evaluation.kind === "wrong") {
      setCheckpointStatus("wrong");
      setCheckpointMessage(currentStep.feedback?.incorrect ?? "Legal move, but it misses the course idea. Re-read the plan and retry.");
      return;
    }
    if (evaluation.kind === "correct") {
      setCheckpointStatus("correct");
      setCheckpointMessage(currentStep.feedback?.correct ?? "Correct. That move matches the plan and structure in this course.");
      setRevealAnswer(true);
      void persistCompletedSteps(activeIndex + 1);
    }
  };

  const goPrevious = () => setActiveIndex(index => Math.max(0, index - 1));
  const goNext = () => {
    if (!currentStep) return;
    if (currentStep.kind === "checkpoint" && checkpointStatus !== "correct") return;
    void persistCompletedSteps(activeIndex + 1);
    setActiveIndex(index => Math.min(steps.length - 1, index + 1));
  };

  if (!lesson || !currentStep || !position) {
    return (
      <main className="app-shell chessiq-shell learn-shell">
        <ProductHeader />
        <section className="lesson-loading" aria-busy={lessonQuery.isLoading}>
          {lessonQuery.error ? <><h1>Opening course not found.</h1><Link href="/learn">Back to Learn</Link></> : "Loading visual opening course…"}
        </section>
      </main>
    );
  }

  const trainerSide = lesson.sideFocus === "black" ? "black" : "white";
  const checkpointReady = currentStep.kind !== "checkpoint" || checkpointStatus === "correct";
  const nextLabel = activeIndex >= steps.length - 1 ? "Finish course" : "Next";

  return (
    <main className="app-shell chessiq-shell learn-shell lesson-shell">
      <ProductHeader />
      <section className="lesson-page">
        <header className="lesson-hero">
          <div className="lesson-hero-copy">
            <Link className="lesson-back-link" href="/learn"><ArrowLeft size={14} aria-hidden="true" /> Opening Courses</Link>
            <p className="eyebrow">{lesson.canonicalEco} · {lesson.ecoRange} · {lesson.difficulty}</p>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
          </div>
          <div className="lesson-session-status">
            <div className="lesson-progress-copy"><span>Course progress</span><strong>{completedSteps}/{steps.length}</strong></div>
            <div className="lesson-progress-track" aria-label={`${percent}% course progress`}><span style={{ width: `${percent}%` }} /></div>
            {!isAuthenticated ? (
              <button type="button" className="lesson-save-cta" onClick={() => startLogin()}><Save size={14} aria-hidden="true" /> Sign in to save progress</button>
            ) : notSynced ? (
              <span className="lesson-sync-state is-error">Not synced</span>
            ) : (
              <span className="lesson-sync-state"><CheckCircle2 size={13} aria-hidden="true" /> Saved to your learning progress</span>
            )}
          </div>
        </header>

        <div className="lesson-workspace">
          <aside className="lesson-outline-region">
            <LessonOutline lesson={lesson} activeIndex={activeIndex} completedSteps={completedSteps} onSelect={setActiveIndex} />
          </aside>

          <section className="lesson-board-region" aria-label="Interactive lesson board">
            <div className="lesson-board-toolbar">
              <span>{lesson.canonicalName}</span>
              <button type="button" onClick={() => setOrientation(value => value === "white" ? "black" : "white")}><FlipHorizontal2 size={14} aria-hidden="true" /> Flip board</button>
            </div>
            <OpeningBoardWorkspace
              fen={position.fen}
              orientation={orientation}
              interactive={currentStep.kind === "checkpoint"}
              expectedMove={revealAnswer ? currentStep.acceptedMoves?.[0] ?? null : null}
              annotations={currentStep.annotations ?? []}
              onMove={handleLessonMove}
            />
            <div className="lesson-board-hint">
              <span>{currentStep.kind === "checkpoint" ? "Your move · choose on the board" : "Study position · visual cues follow the lesson"}</span>
              <span>{position.legalMoves.length} legal moves</span>
            </div>
          </section>

          <aside className="lesson-panel-region">
            <LessonExplanation step={currentStep} />
            <LessonCheckpoint
              step={currentStep}
              status={checkpointStatus}
              message={checkpointMessage}
              revealAnswer={revealAnswer}
              onReveal={() => setRevealAnswer(true)}
              onRetry={() => { setCheckpointStatus("idle"); setCheckpointMessage(null); setRevealAnswer(false); }}
            />
            <div className="lesson-navigation" aria-label="Lesson step navigation">
              <button type="button" onClick={goPrevious} disabled={activeIndex === 0}><ChevronLeft size={15} aria-hidden="true" /> {"Previous"}</button>
              <span>{activeIndex + 1} / {steps.length}</span>
              <button type="button" className="is-primary" onClick={goNext} disabled={!checkpointReady}><span>{nextLabel === "Next" ? "Next" : nextLabel}</span><ChevronRight size={15} aria-hidden="true" /></button>
            </div>
            <div className="lesson-handoffs">
              <Link href={`/openings/${lesson.openingSlug}`}><Compass size={14} aria-hidden="true" /> View in Explorer</Link>
              <Link href={`/trainer?slug=${encodeURIComponent(lesson.openingSlug)}&side=${trainerSide}`}><Target size={14} aria-hidden="true" /> Train this line</Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

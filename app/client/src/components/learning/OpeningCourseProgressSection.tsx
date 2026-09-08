import { BookOpenCheck, CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export function OpeningCourseProgressSection() {
  const catalog = trpc.learn.catalog.useQuery();
  const progress = trpc.learn.progress.useQuery();

  const openingLessons = catalog.data?.filter(lesson => lesson.kind === "opening") ?? [];
  const progressFor = (lessonKey: string) => progress.data?.find(item => item.lessonKey === lessonKey);

  const completedLessons = openingLessons.filter(lesson => {
    const item = progressFor(lesson.key);
    return item?.status === "completed" || (item?.completedSteps ?? 0) >= lesson.steps;
  });
  const inProgressLessons = openingLessons.filter(lesson => {
    const item = progressFor(lesson.key);
    const completedSteps = item?.completedSteps ?? 0;
    const completed = item?.status === "completed" || completedSteps >= lesson.steps;
    return !completed && completedSteps > 0;
  });
  const nextLesson = inProgressLessons[0]
    ?? openingLessons.find(lesson => {
      const item = progressFor(lesson.key);
      return item?.status !== "completed" && (item?.completedSteps ?? 0) < lesson.steps;
    })
    ?? openingLessons[0];

  return (
    <section className="opening-course-progress-section" aria-labelledby="opening-course-progress-heading">
      <div className="opening-progress-head">
        <div>
          <p className="eyebrow">Opening courses</p>
          <h2 id="opening-course-progress-heading">Study progress, separate from repertoire mastery.</h2>
          <p>Course completion tracks study progress. Repertoire mastery is measured separately by your trainer reviews and spaced-repetition results.</p>
        </div>
        {nextLesson ? (
          <Link className="opening-primary-action" href={`/learn/openings/${nextLesson.slug}`}>
            Continue learning <ChevronRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div className="opening-course-progress-metrics">
        <article className="opening-progress-card">
          <BookOpenCheck size={19} aria-hidden="true" />
          <span>Opening courses</span>
          <strong>{openingLessons.length}</strong>
          <small>Available in the learning library</small>
        </article>
        <article className="opening-progress-card">
          <PlayCircle size={19} aria-hidden="true" />
          <span>In progress</span>
          <strong>{inProgressLessons.length}</strong>
          <small>Courses with saved checkpoints</small>
        </article>
        <article className="opening-progress-card">
          <CheckCircle2 size={19} aria-hidden="true" />
          <span>Completed</span>
          <strong>{completedLessons.length}</strong>
          <small>Study paths finished, not a mastery claim</small>
        </article>
      </div>

      {catalog.isLoading || progress.isLoading ? (
        <div className="opening-progress-loading">Loading opening course progress…</div>
      ) : !openingLessons.length ? (
        <div className="opening-progress-empty">Opening courses are not available right now.</div>
      ) : null}
    </section>
  );
}

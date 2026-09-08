import { BookOpenCheck, CheckCircle2, ChevronRight, Compass, Layers3, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ProductHeader } from "@/components/ProductHeader";
import { LessonFilters } from "@/components/learning/LessonFilters";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const DEFAULT_FILTERS = {
  query: "",
  family: "all",
  sideFocus: "all",
  difficulty: "all",
};

const FAMILY_LABELS: Record<string, string> = {
  e4: "1.e4",
  "sicilian-defenses": "Sicilian",
  d4: "1.d4",
  "indian-defenses": "Indian",
  "flank-and-systems": "Flank & systems",
};

export default function LearnPage() {
  const { isAuthenticated } = useAuth();
  const lessons = trpc.learn.catalog.useQuery();
  const progress = trpc.learn.progress.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const saveFoundation = trpc.learn.saveProgress.useMutation({
    onSuccess: async () => {
      await utils.learn.progress.invalidate();
      toast("Learning progress saved.");
    },
  });

  const openingLessons = useMemo(
    () => lessons.data?.filter(lesson => lesson.kind === "opening") ?? [],
    [lessons.data],
  );
  const foundationLessons = useMemo(
    () => lessons.data?.filter(lesson => lesson.kind === "foundation") ?? [],
    [lessons.data],
  );

  const visibleOpenings = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return openingLessons.filter(lesson => {
      const searchText = [lesson.title, lesson.summary, lesson.ecoRange, lesson.family, ...lesson.tags].join(" ").toLowerCase();
      if (query && !searchText.includes(query)) return false;
      if (filters.family !== "all" && lesson.family !== filters.family) return false;
      if (filters.sideFocus !== "all" && lesson.sideFocus !== filters.sideFocus) return false;
      if (filters.difficulty !== "all" && lesson.difficulty !== filters.difficulty) return false;
      return true;
    });
  }, [filters, openingLessons]);

  const progressFor = (lessonKey: string) => progress.data?.find(entry => entry.lessonKey === lessonKey);

  return (
    <main className="app-shell chessiq-shell learn-shell">
      <ProductHeader />
      <section className="product-page learn-page">
        <header className="learn-hero">
          <div>
            <p className="eyebrow">ChessIQ Learn</p>
            <h1>Build an opening repertoire you actually understand.</h1>
            <p>Study plans, structures, danger squares, common mistakes, and legal move checkpoints across a complete 100-course opening library.</p>
          </div>
          <div className="learn-hero-metrics" aria-label="Opening course library summary">
            <article><strong>{openingLessons.length || 100}</strong><span>full courses</span></article>
            <article><strong>5</strong><span>opening families</span></article>
            <article><strong>2</strong><span>interactive checkpoints each</span></article>
          </div>
        </header>

        <section className="learn-foundations" aria-labelledby="foundation-paths-heading">
          <div className="learn-section-heading">
            <div>
              <p className="eyebrow">Foundation paths</p>
              <h2 id="foundation-paths-heading">Keep the fundamentals close.</h2>
            </div>
            <span>{foundationLessons.length} short paths</span>
          </div>
          <div className="foundation-grid">
            {foundationLessons.map(lesson => {
              const item = progressFor(lesson.key);
              const completed = item?.status === "completed";
              return (
                <article key={lesson.key} className="foundation-card">
                  <div className="foundation-card-icon"><BookOpenCheck size={19} aria-hidden="true" /></div>
                  <div>
                    <span>{lesson.difficulty}</span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <small>{item?.completedSteps ?? 0}/{lesson.steps} checkpoints saved</small>
                  </div>
                  {isAuthenticated ? (
                    <button
                      className="foundation-action"
                      disabled={saveFoundation.isPending || completed}
                      onClick={() => saveFoundation.mutate({ lessonKey: lesson.key, status: "completed", completedSteps: lesson.steps })}
                      type="button"
                    >
                      {completed ? <><CheckCircle2 size={14} aria-hidden="true" /> Completed</> : "Mark complete"}
                    </button>
                  ) : (
                    <button className="foundation-action" onClick={() => startLogin()} type="button">Sign in to save</button>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="opening-course-library" aria-labelledby="opening-courses-heading">
          <div className="learn-section-heading opening-course-heading">
            <div>
              <p className="eyebrow">Opening Courses</p>
              <h2 id="opening-courses-heading">Choose the position you want to understand next.</h2>
              <p>Every course is immediately available. Search by opening, ECO family, side, or difficulty.</p>
            </div>
            <div className="learn-library-badges" aria-hidden="true">
              <span><Compass size={13} /> repertoire</span>
              <span><Layers3 size={13} /> structures</span>
              <span><Sparkles size={13} /> visual ideas</span>
            </div>
          </div>

          <LessonFilters
            query={filters.query}
            family={filters.family}
            sideFocus={filters.sideFocus}
            difficulty={filters.difficulty}
            resultCount={visibleOpenings.length}
            onQueryChange={query => setFilters(current => ({ ...current, query }))}
            onFamilyChange={family => setFilters(current => ({ ...current, family }))}
            onSideFocusChange={sideFocus => setFilters(current => ({ ...current, sideFocus }))}
            onDifficultyChange={difficulty => setFilters(current => ({ ...current, difficulty }))}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />

          {lessons.isLoading ? (
            <div className="lesson-library-state">Loading opening courses…</div>
          ) : visibleOpenings.length ? (
            <div className="opening-course-grid">
              {visibleOpenings.map(lesson => {
                const item = progressFor(lesson.key);
                const completedSteps = item?.completedSteps ?? 0;
                const completed = item?.status === "completed" || completedSteps >= lesson.steps;
                const actionLabel = completed ? "Review" : completedSteps > 0 ? "Continue" : "Start course";
                const percent = Math.min(100, Math.round((completedSteps / Math.max(1, lesson.steps)) * 100));
                return (
                  <article key={lesson.key} className="opening-course-card">
                    <div className="opening-course-card-top">
                      <span className="opening-course-family">{FAMILY_LABELS[lesson.family] ?? lesson.family}</span>
                      <span className={`opening-course-difficulty is-${lesson.difficulty}`}>{lesson.difficulty}</span>
                    </div>
                    <div className="opening-course-eco">{lesson.ecoRange}</div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <div className="opening-course-tags" aria-label={`${lesson.title} topics`}>
                      {lesson.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}
                    </div>
                    <div className="opening-course-meta">
                      <span>{lesson.sideFocus === "both" ? "White + Black" : `${lesson.sideFocus[0]?.toUpperCase()}${lesson.sideFocus.slice(1)} focus`}</span>
                      <span>{lesson.steps} steps</span>
                    </div>
                    {isAuthenticated ? (
                      <div className="opening-course-progress" aria-label={`${percent}% course progress`}>
                        <span style={{ width: `${percent}%` }} />
                      </div>
                    ) : null}
                    <Link className="opening-course-action" href={`/learn/openings/${lesson.slug}`}>
                      <span>{actionLabel}</span><ChevronRight size={16} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="lesson-library-state">
              <h3>No courses match these filters.</h3>
              <p>Clear the filters or try a broader opening name.</p>
              <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>Show all courses</button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

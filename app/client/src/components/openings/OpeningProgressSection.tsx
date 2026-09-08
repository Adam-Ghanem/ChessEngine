import { Clock3, Crosshair, Shield, Target, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function OpeningProgressSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const progress = trpc.openings.progress.useQuery(undefined, { enabled: isAuthenticated });
  if (!isAuthenticated) return null;

  const data = progress.data;
  const hasEvidence = Boolean(data?.items.length);

  return (
    <section className="opening-progress-section" aria-label="Opening repertoire progress">
      <div className="opening-progress-head">
        <div>
          <p className="eyebrow">Opening mastery</p>
          <h2>Your repertoire memory, measured from reviews.</h2>
          <p>Mastery uses your recorded accuracy, retention, due state, and review intervals. No completed line is treated as mastered by default.</p>
        </div>
        <Link className="opening-primary-action" href="/trainer?mode=mixed"><Target size={16}/> Continue training</Link>
      </div>

      {progress.isLoading ? <div className="opening-progress-loading opening-panel" aria-busy="true">Loading opening review history…</div> : progress.error ? <div className="opening-progress-loading opening-panel">Opening progress could not be loaded.</div> : data ? (
        <>
          <div className="opening-progress-metrics">
            <article className="opening-progress-card"><Shield size={18}/><span>White repertoire</span><strong>{data.white.averageMastery}%</strong><small>{data.white.lines} reviewed lines · {data.white.due} due</small></article>
            <article className="opening-progress-card"><Shield size={18}/><span>Black repertoire</span><strong>{data.black.averageMastery}%</strong><small>{data.black.lines} reviewed lines · {data.black.due} due</small></article>
            <article className="opening-progress-card"><Clock3 size={18}/><span>Due reviews</span><strong>{data.dueCount}</strong><small>{data.dueCount ? "Ready for spaced repetition" : "Nothing overdue right now"}</small></article>
            <article className="opening-progress-card"><Crosshair size={18}/><span>Recent accuracy</span><strong>{hasEvidence ? percent(data.recentAccuracy) : "—"}</strong><small>{hasEvidence ? "From your recent recorded attempts" : "No review evidence yet"}</small></article>
          </div>

          <section className="opening-weakest opening-panel">
            <div className="opening-panel-title"><TrendingDown size={16}/><span>Weakest branches</span></div>
            {data.weakest.length ? <div className="opening-weakest-list">{data.weakest.map(item => (
              <article key={`${item.opening.id}-${item.side}`}>
                <div><span className="opening-eco-badge">{item.opening.eco}</span><strong>{item.opening.name}</strong><small>{item.side} · {Math.round(item.accuracy * 100)}% accuracy · {item.lapses} lapses</small></div>
                <div className="opening-mastery-score"><span>{item.mastery.state} mastery</span><strong>{item.mastery.score}%</strong><Link href={`/trainer?slug=${encodeURIComponent(item.opening.slug)}&side=${item.side}&mode=recall`}>Review</Link></div>
              </article>
            ))}</div> : <div className="opening-progress-empty">No opening review evidence yet. Train a line to establish your first mastery baseline.</div>}
          </section>
        </>
      ) : null}
    </section>
  );
}

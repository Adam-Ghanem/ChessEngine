import { Chess } from "chess.js";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, FlipHorizontal2, Target } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { ProductHeader } from "@/components/ProductHeader";
import { OpeningBoardWorkspace } from "@/components/openings/OpeningBoardWorkspace";
import { OpeningStatsPanel } from "@/components/openings/OpeningStatsPanel";
import { trpc } from "@/lib/trpc";

function fenAtPly(uci: readonly string[], ply: number) {
  const chess = new Chess();
  for (const move of uci.slice(0, ply)) chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] as "q" | "r" | "b" | "n" | undefined });
  return chess.fen();
}

export default function OpeningDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const detail = trpc.openings.detail.useQuery({ slug }, { enabled: Boolean(slug) });
  const [activePly, setActivePly] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const opening = detail.data?.opening;
  const ply = opening ? Math.min(activePly ?? opening.uci.length, opening.uci.length) : 0;
  const fen = opening ? fenAtPly(opening.uci, ply) : new Chess().fen();
  const stats = trpc.openings.stats.useQuery({ fen }, { enabled: Boolean(opening) });

  return (
    <main className="app-shell chessiq-shell openings-shell">
      <ProductHeader />
      {!opening ? <section className="opening-detail-loading" aria-busy={detail.isLoading}>{detail.error ? "Opening not found." : "Loading opening…"}</section> : (
        <>
          <section className="opening-detail-hero">
            <div>
              <Link className="opening-back-link" href="/openings"><ArrowLeft size={15} /> Explorer</Link>
              <p className="eyebrow">{opening.eco} · canonical local repertoire</p>
              <h1>{opening.name}</h1>
              <p>{opening.summary}</p>
              <div className="opening-breadcrumbs">{detail.data?.ancestors.map(item => <Link key={item.id} href={`/openings/${item.slug}`}>{item.name}</Link>)}</div>
            </div>
            <div className="opening-detail-actions">
              <button className="opening-secondary-action" type="button" onClick={() => setOrientation(value => value === "white" ? "black" : "white")}><FlipHorizontal2 size={16} /> Flip</button>
              <Link className="opening-primary-action opening-train-cta" href={`/trainer?slug=${encodeURIComponent(opening.slug)}&side=${orientation}`}><Target size={16} /> Train this line</Link>
            </div>
          </section>

          <section className="opening-detail-grid">
            <div className="opening-detail-board">
              <OpeningBoardWorkspace fen={fen} orientation={orientation} activeMove={ply ? opening.uci[ply - 1] : null} />
              <div className="opening-transport" aria-label="Opening line controls">
                <button type="button" aria-label="First move" onClick={() => setActivePly(0)} disabled={ply === 0}><ChevronsLeft size={16} /></button>
                <button type="button" aria-label="Previous move" onClick={() => setActivePly(Math.max(0, ply - 1))} disabled={ply === 0}><ArrowLeft size={16} /></button>
                <span><strong>{ply}</strong> / {opening.uci.length} ply</span>
                <button type="button" aria-label="Next move" onClick={() => setActivePly(Math.min(opening.uci.length, ply + 1))} disabled={ply >= opening.uci.length}><ArrowRight size={16} /></button>
                <button type="button" aria-label="Last move" onClick={() => setActivePly(opening.uci.length)} disabled={ply >= opening.uci.length}><ChevronsRight size={16} /></button>
              </div>
              <div className="opening-move-timeline">{opening.san.map((san, index) => <button type="button" key={`${san}-${index}`} className={index + 1 === ply ? "is-active" : ""} onClick={() => setActivePly(index + 1)}>{index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ""}{san}</button>)}</div>
            </div>
            <aside className="opening-detail-insights">
              <OpeningStatsPanel data={stats.data} loading={stats.isLoading} />
              <section className="opening-panel opening-ideas-panel"><div className="opening-panel-title"><Target size={16}/><span>Plans and themes</span></div><h3>White ideas</h3><ul>{opening.ideasWhite?.map(idea => <li key={idea}>{idea}</li>)}</ul><h3>Black ideas</h3><ul>{opening.ideasBlack?.map(idea => <li key={idea}>{idea}</li>)}</ul></section>
              {detail.data?.children.length ? <section className="opening-panel"><div className="opening-panel-title"><span>Continue deeper</span></div><div className="opening-variation-links">{detail.data.children.slice(0, 12).map(child => <Link key={child.id} href={`/openings/${child.slug}`}><span>{child.eco}</span>{child.name}</Link>)}</div></section> : null}
            </aside>
          </section>
          <div className="opening-mobile-train-dock"><Link href={`/trainer?slug=${encodeURIComponent(opening.slug)}&side=${orientation}`}>Train this line</Link></div>
        </>
      )}
    </main>
  );
}

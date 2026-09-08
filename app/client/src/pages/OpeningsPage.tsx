import { Chess } from "chess.js";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, ExternalLink, FlipHorizontal2, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ProductHeader } from "@/components/ProductHeader";
import { OpeningBoardWorkspace } from "@/components/openings/OpeningBoardWorkspace";
import { OpeningSearch } from "@/components/openings/OpeningSearch";
import { OpeningStatsPanel } from "@/components/openings/OpeningStatsPanel";
import { OpeningTree, type OpeningTreeItem } from "@/components/openings/OpeningTree";
import { trpc } from "@/lib/trpc";

function fenAtPly(uci: readonly string[], ply: number) {
  const chess = new Chess();
  for (const move of uci.slice(0, ply)) {
    chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] as "q" | "r" | "b" | "n" | undefined });
  }
  return chess.fen();
}

export default function OpeningsPage() {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activePly, setActivePly] = useState(0);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const catalog = trpc.openings.catalog.useQuery({ limit: 100 });
  const search = trpc.openings.search.useQuery({ query, limit: 100 }, { enabled: query.trim().length > 0 });
  const items = query.trim() ? search.data ?? [] : catalog.data?.items ?? [];
  const selected = useMemo(() => items.find(item => item.slug === selectedSlug) ?? items[0] ?? null, [items, selectedSlug]);
  const ply = selected ? Math.min(activePly, selected.uci.length) : 0;
  const fen = selected ? fenAtPly(selected.uci, ply) : new Chess().fen();
  const stats = trpc.openings.stats.useQuery({ fen }, { enabled: Boolean(selected) });

  const chooseOpening = (item: OpeningTreeItem) => {
    setSelectedSlug(item.slug);
    const full = items.find(candidate => candidate.slug === item.slug);
    setActivePly(full?.uci.length ?? 0);
  };

  return (
    <main className="app-shell chessiq-shell openings-shell">
      <ProductHeader />
      <section className="openings-page-head">
        <div>
          <p className="eyebrow">ChessIQ opening intelligence</p>
          <h1>Openings Explorer</h1>
          <p>Browse the full local ECO catalog, replay legal lines, compare master statistics, and move directly into recall training.</p>
        </div>
        <Link className="opening-primary-action" href="/trainer?mode=mixed"><Target size={16} /> Train due lines</Link>
      </section>

      <section className="openings-workspace" aria-label="Openings Explorer workspace">
        <aside className="opening-tree-column opening-panel">
          <div className="opening-panel-kicker">A00–E99 catalog</div>
          <OpeningSearch value={query} onChange={value => { setQuery(value); setSelectedSlug(null); setActivePly(0); }} />
          <OpeningTree items={items} selectedSlug={selected?.slug} onSelect={chooseOpening} />
        </aside>

        <section className="opening-board-column">
          {selected ? (
            <>
              <header className="opening-identity-card">
                <div><span className="opening-eco-badge">{selected.eco}</span><h2>{selected.name}</h2><p>{selected.summary}</p></div>
                <div className="opening-identity-actions">
                  <button type="button" className="opening-icon-action" aria-label="Flip board" onClick={() => setOrientation(value => value === "white" ? "black" : "white")}><FlipHorizontal2 size={16} /></button>
                  <Link className="opening-secondary-action" href={`/openings/${selected.slug}`}><ExternalLink size={15} /> Detail</Link>
                </div>
              </header>
              <OpeningBoardWorkspace fen={fen} orientation={orientation} activeMove={ply ? selected.uci[ply - 1] : null} />
              <div className="opening-transport" aria-label="Opening line controls">
                <button type="button" aria-label="First move" onClick={() => setActivePly(0)} disabled={ply === 0}><ChevronsLeft size={16} /></button>
                <button type="button" aria-label="Previous move" onClick={() => setActivePly(Math.max(0, ply - 1))} disabled={ply === 0}><ArrowLeft size={16} /></button>
                <span><strong>{ply}</strong> / {selected.uci.length} ply</span>
                <button type="button" aria-label="Next move" onClick={() => setActivePly(Math.min(selected.uci.length, ply + 1))} disabled={ply >= selected.uci.length}><ArrowRight size={16} /></button>
                <button type="button" aria-label="Last move" onClick={() => setActivePly(selected.uci.length)} disabled={ply >= selected.uci.length}><ChevronsRight size={16} /></button>
              </div>
              <div className="opening-move-timeline" aria-label="Opening moves">
                {selected.san.map((san, index) => <button type="button" key={`${san}-${index}`} className={index + 1 === ply ? "is-active" : ""} onClick={() => setActivePly(index + 1)}>{index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ""}{san}</button>)}
              </div>
            </>
          ) : <div className="opening-empty-state">Choose an opening to start exploring.</div>}
        </section>

        <aside className="opening-insight-column">
          <OpeningStatsPanel data={stats.data} loading={stats.isLoading} />
          {selected ? <section className="opening-panel opening-ideas-panel"><div className="opening-panel-title"><Target size={16} /><span>Ideas to remember</span></div><h3>White</h3><ul>{selected.ideasWhite?.map(idea => <li key={idea}>{idea}</li>)}</ul><h3>Black</h3><ul>{selected.ideasBlack?.map(idea => <li key={idea}>{idea}</li>)}</ul></section> : null}
        </aside>
      </section>

      {selected ? <div className="opening-mobile-train-dock"><Link href={`/trainer?slug=${encodeURIComponent(selected.slug)}&side=${orientation}`}>Train this line</Link></div> : null}
    </main>
  );
}

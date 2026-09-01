import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Search, Sparkles, Target } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { openingFamilies, searchOpeningFamilies } from "@/data/openings";
import "../openings.css";

export default function Openings() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchOpeningFamilies(query), [query]);

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell openings-product-shell">
        <ProductHeader activePath="/learn" />

        <section className="openings-hero">
          <div>
            <Link href="/learn" className="openings-back"><ArrowLeft size={15} /> Back to Learn</Link>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Openings</div>
            <h1>Understand the opening, not just the moves.</h1>
            <p>Start with the major opening families and learn the structure, plans, and ideas behind the first moves. Open a family to replay its canonical line on the board through the first-party ChessEngine.</p>
          </div>
          <div className="openings-hero-stat" aria-label={`${openingFamilies.length} opening families available`}>
            <span>Opening families</span>
            <strong>{openingFamilies.length}</strong>
            <small>Search by name, alias, ECO, or moves</small>
          </div>
        </section>

        <section className="openings-toolbar" aria-label="Opening explorer controls">
          <label className="openings-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search openings</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Sicilian, B20, 1. e4 c5..."
              autoComplete="off"
            />
          </label>
          <span className="openings-result-count" aria-live="polite">{results.length} result{results.length === 1 ? "" : "s"}</span>
        </section>

        {results.length ? (
          <section className="openings-grid" aria-label="Opening families">
            {results.map((opening) => (
              <Link key={opening.id} href={`/learn/openings/${opening.id}`} className="opening-card-link" aria-label={`Study ${opening.name}`}>
                <article className="opening-card">
                  <header>
                    <span className="opening-icon"><BookOpen size={18} /></span>
                    <span className="opening-eco">{opening.eco}</span>
                  </header>
                  <h2>{opening.name}</h2>
                  <code>{opening.moves}</code>
                  <p>{opening.character}</p>
                  <div className="opening-plan">
                    <strong>White plan</strong>
                    <span>{opening.whitePlan}</span>
                  </div>
                  <div className="opening-plan">
                    <strong>Black plan</strong>
                    <span>{opening.blackPlan}</span>
                  </div>
                  <div className="opening-aliases" aria-label={`Related names for ${opening.name}`}>
                    {opening.aliases.slice(0, 3).map((alias) => <span key={alias}>{alias}</span>)}
                  </div>
                  <span className="opening-study-link">Study on board <ArrowRight size={14} /></span>
                </article>
              </Link>
            ))}
          </section>
        ) : (
          <section className="openings-empty" aria-labelledby="openings-empty-title">
            <Target size={24} />
            <h2 id="openings-empty-title">No opening family matches that search.</h2>
            <p>Try an ECO code, a family name, an alias, or the first moves of the line.</p>
            <button type="button" onClick={() => setQuery("")}>Clear search</button>
          </section>
        )}

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Learn the structure. Recognize the plan.</p>
          <span>First-party ChessEngine remains the analysis engine.</span>
        </footer>
      </div>
    </main>
  );
}

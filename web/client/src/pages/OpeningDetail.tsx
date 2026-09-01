import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import { Link, useParams } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { LegalChessBoard } from "@/components/LegalChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { getOpeningFamilyById } from "@/data/openings";
import { playMove } from "@/engine/playEngine";
import { analysisHrefForFen } from "@/lib/analysisRoute";
import "../opening-detail.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function sanMoves(line: string) {
  return line.split(/\s+/).filter((token) => token && !/^\d+\.$/.test(token));
}

export default function OpeningDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const opening = useMemo(() => getOpeningFamilyById(id), [id]);
  const [positions, setPositions] = useState<string[]>([START_FEN]);
  const [currentPly, setCurrentPly] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPositions([START_FEN]);
    setCurrentPly(0);
    setBusy(false);
    setError(null);
  }, [id]);

  if (!opening) {
    return (
      <main className="app-shell chessiq-shell">
        <div className="analysis-product-shell opening-detail-product-shell">
          <ProductHeader activePath="/learn" />
          <section className="opening-detail-missing" aria-labelledby="opening-missing-title">
            <span className="analysis-label">Opening not found</span>
            <h1 id="opening-missing-title">That opening family is not in the current ChessIQ catalog.</h1>
            <p>Return to the explorer and choose one of the verified opening families.</p>
            <Link href="/learn/openings" className="primary-action opening-detail-primary"><ArrowLeft size={15} /> Opening Explorer</Link>
          </section>
        </div>
      </main>
    );
  }

  const activeOpening = opening;
  const sans = sanMoves(activeOpening.moves);
  const currentFen = positions[currentPly] ?? START_FEN;
  const lastMove = currentPly > 0 ? activeOpening.uci[currentPly - 1] : null;
  const atStart = currentPly === 0;
  const atEnd = currentPly === activeOpening.uci.length;

  async function nextMove() {
    if (busy || atEnd) return;
    if (positions[currentPly + 1]) {
      setCurrentPly((value) => value + 1);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await playMove(currentFen, activeOpening.uci[currentPly]);
      setPositions((current) => [...current, result.fen]);
      setCurrentPly((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to replay this opening move.");
    } finally {
      setBusy(false);
    }
  }

  function previousMove() {
    if (busy || atStart) return;
    setError(null);
    setCurrentPly((value) => Math.max(0, value - 1));
  }

  function jumpToPly(ply: number) {
    if (busy || ply >= positions.length) return;
    setError(null);
    setCurrentPly(ply);
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell opening-detail-product-shell">
        <ProductHeader activePath="/learn" />

        <section className="opening-detail-hero">
          <div>
            <Link href="/learn/openings" className="openings-back"><ArrowLeft size={15} /> Opening Explorer</Link>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> {activeOpening.eco} · Opening study</div>
            <h1>{activeOpening.name}</h1>
            <p>{activeOpening.character}</p>
          </div>
          <Link href={analysisHrefForFen(currentFen)} className="opening-analyze-action">
            <Search size={16} /> Analyze this position <ArrowRight size={15} />
          </Link>
        </section>

        <section className="opening-detail-layout" aria-label={`${activeOpening.name} study workspace`}>
          <div className="opening-board-column">
            <div className="opening-board-card">
              <div className="opening-board-meta">
                <div><span className="analysis-label">Board position</span><strong>{currentPly === 0 ? "Starting position" : `After ${sans[currentPly - 1] ?? activeOpening.uci[currentPly - 1]}`}</strong></div>
                <span>{currentPly}/{activeOpening.uci.length} plies</span>
              </div>
              <LegalChessBoard
                fen={currentFen}
                legalMoves={[]}
                disabled
                onMove={() => undefined}
                lastMove={lastMove}
                ariaLabel={`${activeOpening.name} opening board after ${currentPly} plies`}
              />
              <div className="opening-board-controls" aria-label="Opening move navigation">
                <button type="button" onClick={previousMove} disabled={busy || atStart}><ChevronLeft size={17} /> Previous</button>
                <button type="button" className="is-primary" onClick={nextMove} disabled={busy || atEnd}>
                  {busy ? "Checking move…" : atEnd ? "Line complete" : "Next move"} <ChevronRight size={17} />
                </button>
              </div>
              {error && <div className="opening-replay-error" role="alert"><strong>ChessEngine could not replay the line.</strong><span>{error}</span></div>}
            </div>

            <div className="opening-move-timeline" aria-label={`${activeOpening.name} move timeline`}>
              <button type="button" className={currentPly === 0 ? "is-active" : ""} onClick={() => jumpToPly(0)}>Start</button>
              {sans.map((move, index) => {
                const ply = index + 1;
                const available = ply < positions.length;
                return (
                  <button
                    type="button"
                    key={`${activeOpening.id}-${ply}`}
                    className={currentPly === ply ? "is-active" : ""}
                    disabled={!available || busy}
                    onClick={() => jumpToPly(ply)}
                    aria-label={`Go to ply ${ply}: ${move}`}
                  >
                    {move}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="opening-study-rail" aria-label={`${activeOpening.name} plans`}>
            <section>
              <span className="analysis-label">Canonical line</span>
              <code>{activeOpening.moves}</code>
            </section>
            <section>
              <span className="analysis-label">White plan</span>
              <p>{activeOpening.whitePlan}</p>
            </section>
            <section>
              <span className="analysis-label">Black plan</span>
              <p>{activeOpening.blackPlan}</p>
            </section>
            <section>
              <span className="analysis-label">Related names</span>
              <div className="opening-detail-aliases">{activeOpening.aliases.map((alias) => <span key={alias}>{alias}</span>)}</div>
            </section>
          </aside>
        </section>

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Replay the line. Understand the plan. Analyze the position.</p>
          <span>Move replay is validated by the first-party ChessEngine.</span>
        </footer>
      </div>
    </main>
  );
}

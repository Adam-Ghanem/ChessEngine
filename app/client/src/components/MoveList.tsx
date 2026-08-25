/**
 * Calculated Fieldwork design system: notation is an indexed timeline, never a dense generic data table.
 */
import type { AnalysisMove } from "@/types/analysis";
import { ClassificationBadge } from "@/components/ClassificationBadge";

interface MoveListProps {
  moves: AnalysisMove[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function MoveList({ moves, activeIndex, onSelect }: MoveListProps) {
  const rows = Array.from(new Set(moves.map((move) => move.fullMove))).map((fullMove) => ({
    fullMove,
    whiteIndex: moves.findIndex((move) => move.fullMove === fullMove && move.side === "white"),
    blackIndex: moves.findIndex((move) => move.fullMove === fullMove && move.side === "black"),
  }));

  return (
    <section className="move-list-panel" aria-labelledby="move-list-heading">
      <div className="panel-heading-row">
        <div>
          <p className="eyebrow">Game record</p>
          <h2 id="move-list-heading">Move timeline</h2>
        </div>
        <span className="move-count">{moves.length} plies</span>
      </div>
      <div className="move-timeline" role="list">
        {rows.map(({ fullMove, whiteIndex, blackIndex }) => (
          <div className="move-row" key={fullMove}>
            <span className="move-number">{fullMove}.</span>
            {[whiteIndex, blackIndex].map((moveIndex) => {
              if (moveIndex < 0) return <span className="move-cell empty" key={`${fullMove}-${moveIndex}`} />;
              const move = moves[moveIndex];
              return (
                <button
                  className={`move-cell ${activeIndex === moveIndex ? "is-current" : ""}`}
                  key={move.id}
                  onClick={() => onSelect(moveIndex)}
                  aria-current={activeIndex === moveIndex ? "step" : undefined}
                >
                  <span className="move-san">{move.san}</span>
                  <ClassificationBadge classification={move.classification} compact />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

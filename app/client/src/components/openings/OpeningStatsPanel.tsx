import { BarChart3, CloudOff, Database, Radio } from "lucide-react";

export type OpeningStatsData = {
  status: "live" | "stale" | "unavailable";
  cached: boolean;
  totalGames: number;
  moves: Array<{
    uci: string;
    san: string;
    games: number;
    white: number;
    draws: number;
    black: number;
    averageRating?: number;
  }>;
};

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function OpeningStatsPanel({ data, loading }: { data?: OpeningStatsData; loading?: boolean }) {
  if (loading) {
    return <section className="opening-panel opening-stats-panel" aria-busy="true"><div className="opening-panel-title"><BarChart3 size={16} /><span>Master statistics</span></div><div className="opening-stats-skeleton" /></section>;
  }

  if (!data || data.status === "unavailable") {
    return (
      <section className="opening-panel opening-stats-panel">
        <div className="opening-panel-title"><CloudOff size={16} /><span>Master statistics</span></div>
        <p className="opening-muted">Live statistics are unavailable. The local opening tree and trainer remain fully usable.</p>
      </section>
    );
  }

  return (
    <section className="opening-panel opening-stats-panel">
      <div className="opening-panel-title">
        {data.status === "stale" || data.cached ? <Database size={16} /> : <Radio size={16} />}
        <span>Master statistics</span>
        <em className={`opening-live-state is-${data.status}`}>{data.status === "stale" ? "Cached" : data.cached ? "Fresh cache" : "Live"}</em>
      </div>
      <div className="opening-stat-total"><strong>{data.totalGames.toLocaleString()}</strong><span>master games in position</span></div>
      <div className="opening-move-stats" role="table" aria-label="Popular master opening moves">
        {data.moves.slice(0, 10).map(move => {
          const white = percentage(move.white, move.games);
          const draws = percentage(move.draws, move.games);
          const black = Math.max(0, 100 - white - draws);
          return (
            <div className="opening-move-stat" key={move.uci} role="row">
              <div className="opening-move-stat-head">
                <strong>{move.san}</strong>
                <code>{move.uci}</code>
                <span>{move.games.toLocaleString()}</span>
              </div>
              <div className="opening-result-bar" aria-label={`White ${white}%, draw ${draws}%, black ${black}%`}>
                <i className="is-white" style={{ width: `${white}%` }} />
                <i className="is-draw" style={{ width: `${draws}%` }} />
                <i className="is-black" style={{ width: `${black}%` }} />
              </div>
              <div className="opening-result-labels"><span>W {white}%</span><span>D {draws}%</span><span>B {black}%</span>{move.averageRating ? <span>Ø {Math.round(move.averageRating)}</span> : null}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

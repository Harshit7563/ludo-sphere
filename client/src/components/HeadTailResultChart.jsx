import { useMemo } from 'react';

export default function HeadTailResultChart({ history }) {
  const chartRows = useMemo(() => [...history].reverse(), [history]);

  const stats = useMemo(() => {
    let heads = 0;
    let tails = 0;
    let wins = 0;
    history.forEach((row) => {
      if (row.outcome === 'head') heads += 1;
      else tails += 1;
      if (row.won) wins += 1;
    });
    const total = history.length;
    return {
      heads,
      tails,
      wins,
      losses: total - wins,
      total,
      headPct: total ? Math.round((heads / total) * 100) : 0,
      tailPct: total ? Math.round((tails / total) * 100) : 0,
      winPct: total ? Math.round((wins / total) * 100) : 0,
    };
  }, [history]);

  if (!history.length) {
    return (
      <p className="ht-history-empty">No flips yet — play your first round above.</p>
    );
  }

  return (
    <div className="ht-result-chart">
      <div className="ht-result-chart-axis">
        <span>Older</span>
        <span>Latest →</span>
      </div>

      <div
        className="ht-result-chart-grid"
        role="img"
        aria-label={`Last ${history.length} flips: ${stats.heads} heads, ${stats.tails} tails`}
      >
        {chartRows.map((row, i) => {
          const isHead = row.outcome === 'head';
          return (
            <div
              key={row.id || `chart-${i}`}
              className={`ht-result-chart-cell ${isHead ? 'head' : 'tail'} ${row.won ? 'win' : 'lose'}`}
              title={`${isHead ? 'Head' : 'Tail'} · ${row.won ? 'Won' : 'Lost'}`}
            >
              <span className="ht-result-chart-letter">{isHead ? 'H' : 'T'}</span>
              <span className={`ht-result-chart-dot ${row.won ? 'up' : 'down'}`} aria-hidden />
            </div>
          );
        })}
      </div>

      <div className="ht-result-chart-legend">
        <span>
          <i className="ht-legend-swatch head" /> Head
        </span>
        <span>
          <i className="ht-legend-swatch tail" /> Tail
        </span>
        <span>
          <i className="ht-legend-swatch up" /> Win
        </span>
        <span>
          <i className="ht-legend-swatch down" /> Loss
        </span>
      </div>

      <div className="ht-result-chart-stats">
        <div className="ht-result-chart-stat">
          <div className="ht-result-chart-stat-head">
            <span>Head</span>
            <strong>{stats.heads}</strong>
          </div>
          <div className="ht-result-chart-bar-track">
            <div
              className="ht-result-chart-bar-fill head"
              style={{ width: `${stats.headPct}%` }}
            />
          </div>
        </div>
        <div className="ht-result-chart-stat">
          <div className="ht-result-chart-stat-head">
            <span>Tail</span>
            <strong>{stats.tails}</strong>
          </div>
          <div className="ht-result-chart-bar-track">
            <div
              className="ht-result-chart-bar-fill tail"
              style={{ width: `${stats.tailPct}%` }}
            />
          </div>
        </div>
        <div className="ht-result-chart-stat">
          <div className="ht-result-chart-stat-head">
            <span>Win rate</span>
            <strong>{stats.winPct}%</strong>
          </div>
          <div className="ht-result-chart-bar-track">
            <div
              className="ht-result-chart-bar-fill win"
              style={{ width: `${stats.winPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

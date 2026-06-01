import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const TABS = [
  { id: 'ludo_1v1', label: 'Ludo 1v1' },
  { id: 'ludo_2v2', label: 'Ludo 2v2' },
  { id: 'head_tail', label: 'Head & Tail' },
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function AdminMatches() {
  const [activeType, setActiveType] = useState('ludo_1v1');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = (type) => {
    setLoading(true);
    setErr(null);
    api(`/admin/matches?type=${encodeURIComponent(type)}`)
      .then((data) => setItems(data.items || []))
      .catch((e) => {
        setErr(e.message || 'Load failed');
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(activeType);
  }, [activeType]);

  const activeLabel = TABS.find((t) => t.id === activeType)?.label || '';

  return (
    <div>
      <h1 className="admin-page-title gold-text">Match History</h1>

      <div className="admin-match-tabs" role="tablist" aria-label="Match type">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeType === tab.id}
            className={`admin-match-tab${activeType === tab.id ? ' admin-match-tab--active' : ''}`}
            onClick={() => setActiveType(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="admin-muted" style={{ marginBottom: 16 }}>
        {activeLabel} — {items.length} record{items.length !== 1 ? 's' : ''}
      </p>

      {err && <div className="alert alert-error">{err}</div>}

      {loading ? (
        <div className="admin-loading">
          <div className="loader" />
        </div>
      ) : (
        <div className="admin-table-wrap">
          {activeType === 'head_tail' ? (
            <table className="table admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Bet</th>
                  <th>Choice</th>
                  <th>Outcome</th>
                  <th>Result</th>
                  <th>Payout</th>
                  <th>Balance after</th>
                  <th>Played at</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-users-empty">
                      Koi Head &amp; Tail round nahi
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.username}</strong>
                        <br />
                        <small>{r.email}</small>
                      </td>
                      <td>₹{Number(r.bet_amount).toFixed(0)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.player_choice}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.outcome}</td>
                      <td>
                        {r.won ? (
                          <span className="admin-status admin-status--active">Won</span>
                        ) : (
                          <span className="admin-status admin-status--banned">Lost</span>
                        )}
                      </td>
                      <td className="gold-text">₹{Number(r.payout || 0).toFixed(0)}</td>
                      <td>₹{Number(r.balance_after || 0).toFixed(0)}</td>
                      <td>
                        <small>{formatDate(r.created_at)}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="table admin-users-table">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Entry</th>
                  <th>Prize</th>
                  <th>Winner</th>
                  <th>Players</th>
                  <th>Status</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-users-empty">
                      Koi {activeLabel} match nahi
                    </td>
                  </tr>
                ) : (
                  items.map((m) => (
                    <tr key={m.id}>
                      <td>{m.mode?.toUpperCase()}</td>
                      <td>₹{Number(m.entry_fee).toFixed(0)}</td>
                      <td className="gold-text">₹{Number(m.prize_pool).toFixed(0)}</td>
                      <td>{m.winner_name || '—'}</td>
                      <td>
                        <small>
                          {Array.isArray(m.players) && m.players.length > 0
                            ? m.players.map((p) => p.username).join(', ')
                            : '—'}
                        </small>
                      </td>
                      <td>
                        <span className="badge badge-gold">{m.status}</span>
                      </td>
                      <td>
                        <small>{formatDate(m.started_at)}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const defaultForm = () => {
  const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    name: '',
    description: '',
    entryFee: 50,
    prizePool: 1000,
    maxPlayers: 32,
    mode: '4p',
    startsAt: toDatetimeLocal(start),
    endsAt: toDatetimeLocal(end),
  };
};

function toDatetimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [modalErr, setModalErr] = useState(null);

  const load = () => api('/admin/tournaments').then(setTournaments).catch(console.error);

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(defaultForm());
    setModalErr(null);
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setModalErr(null);
    setLoading(false);
  };

  const create = async (e) => {
    e.preventDefault();
    setModalErr(null);

    if (!form.name.trim()) {
      setModalErr('Tournament name zaroori hai');
      return;
    }
    if (!form.startsAt || !form.endsAt) {
      setModalErr('Start date aur end date dono daalo');
      return;
    }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      setModalErr('End date, start date ke baad honi chahiye');
      return;
    }

    setLoading(true);
    try {
      await api('/admin/tournaments', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          entryFee: Number(form.entryFee),
          prizePool: Number(form.prizePool),
          maxPlayers: Number(form.maxPlayers),
          mode: form.mode,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
        }),
      });
      setMsg(`Tournament "${form.name.trim()}" add ho gaya`);
      setErr(null);
      closeAdd();
      load();
    } catch (error) {
      setModalErr(error.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (t) => {
    const ok = window.confirm(`Delete "${t.name}"?\nIs tournament ke saath entries bhi hat jayengi.`);
    if (!ok) return;

    setMsg(null);
    setErr(null);
    setDeletingId(t.id);
    try {
      await api(`/admin/tournaments/${t.id}`, { method: 'DELETE' });
      setMsg(`"${t.name}" delete ho gaya`);
      load();
    } catch (error) {
      setErr(error.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title gold-text">Tournament Management</h1>
        <button type="button" className="btn btn-gold btn-sm" onClick={openAdd}>
          + Add tournament
        </button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <div className="admin-table-wrap">
        <table className="table admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Entry</th>
              <th>Prize</th>
              <th>Players</th>
              <th>Mode</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-users-empty">
                  Koi tournament nahi — &quot;Add tournament&quot; dabao
                </td>
              </tr>
            ) : (
              tournaments.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.name}</strong>
                    {t.description ? (
                      <>
                        <br />
                        <small>{t.description}</small>
                      </>
                    ) : null}
                  </td>
                  <td>₹{Number(t.entry_fee).toFixed(0)}</td>
                  <td className="gold-text">₹{Number(t.prize_pool).toFixed(0)}</td>
                  <td>
                    {t.current_players}/{t.max_players}
                  </td>
                  <td>{(t.mode || '4p').toUpperCase()}</td>
                  <td>
                    <small>{formatDateTime(t.starts_at)}</small>
                  </td>
                  <td>
                    <small>{formatDateTime(t.ends_at)}</small>
                  </td>
                  <td>
                    <span className="badge badge-gold">{t.status}</span>
                  </td>
                  <td className="admin-users-cell-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline admin-users-btn"
                      style={{ borderColor: 'var(--red)', color: '#ffb4b4' }}
                      disabled={deletingId === t.id}
                      onClick={() => remove(t)}
                    >
                      {deletingId === t.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeAdd}>
          <div
            className="card admin-wallet-modal admin-tournament-modal"
            role="dialog"
            aria-labelledby="tournament-add-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="tournament-add-title">Tournament add karo</h3>
            <p className="admin-muted" style={{ marginBottom: 16 }}>
              Start / end date, entry fee aur prize pool set karo.
            </p>

            {modalErr && <div className="alert alert-error">{modalErr}</div>}

            <form onSubmit={create}>
              <div className="input-group">
                <label htmlFor="t-name">Name</label>
                <input
                  id="t-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Golden Dice Championship"
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label htmlFor="t-desc">Description (optional)</label>
                <input
                  id="t-desc"
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short info for players"
                />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label htmlFor="t-fee">Entry fee (₹)</label>
                  <input
                    id="t-fee"
                    className="input"
                    type="number"
                    min="0"
                    value={form.entryFee}
                    onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="t-prize">Prize pool (₹)</label>
                  <input
                    id="t-prize"
                    className="input"
                    type="number"
                    min="0"
                    value={form.prizePool}
                    onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label htmlFor="t-max">Max players</label>
                  <input
                    id="t-max"
                    className="input"
                    type="number"
                    min="2"
                    value={form.maxPlayers}
                    onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="t-mode">Mode</label>
                  <select
                    id="t-mode"
                    className="input"
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  >
                    <option value="2p">2P</option>
                    <option value="4p">4P</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label htmlFor="t-start">Start date</label>
                  <input
                    id="t-start"
                    className="input"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="t-end">End date</label>
                  <input
                    id="t-end"
                    className="input"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-wallet-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={closeAdd}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={loading}>
                  {loading ? 'Adding…' : 'Add tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

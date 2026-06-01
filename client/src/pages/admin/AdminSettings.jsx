import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/admin/settings').then(setSettings).catch(console.error);
  }, []);

  const save = async (key, value) => {
    await api(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify(value) });
    setMsg(`${key} updated`);
    api('/admin/settings').then(setSettings);
  };

  const ht = settings.head_tail || {};
  const scrollingBanner = settings.scrolling_banner?.enabled !== false;

  const toggleScrollingBanner = () => {
    save('scrolling_banner', { enabled: !scrollingBanner });
  };

  return (
    <div>
      <h1 className="admin-page-title gold-text">Commission & Settings</h1>
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card" style={{ marginBottom: 16, maxWidth: 520 }}>
        <h3>Home — Scrolling banner</h3>
        <p className="admin-muted" style={{ marginBottom: 12 }}>
          Winners ticker below Daily Spin. Users can also turn it off in Profile → Settings.
        </p>
        <button
          type="button"
          className={`btn btn-sm ${scrollingBanner ? 'btn-gold' : 'btn-outline'}`}
          onClick={toggleScrollingBanner}
        >
          {scrollingBanner ? 'ON — Banner visible' : 'OFF — Banner hidden for everyone'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16, maxWidth: 500 }}>
        <h3>Commission Rate</h3>
        <p className="admin-muted" style={{ margin: '8px 0' }}>
          Current: {settings.commission?.rate || 5}%
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" type="number" id="commission" defaultValue={settings.commission?.rate || 5} style={{ flex: 1 }} />
          <button
            className="btn btn-gold btn-sm"
            onClick={() =>
              save('commission', { rate: Number(document.getElementById('commission').value), enabled: true })
            }
          >
            Save
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, maxWidth: 520 }}>
        <h3>Head & Tail</h3>
        <p className="admin-muted" style={{ marginBottom: 12 }}>
          Timer, payouts, and bet limits for the coin flip game.
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="admin-muted" style={{ fontSize: 12 }}>
            Bet timer (seconds)
            <input className="input" type="number" id="ht-betSeconds" defaultValue={ht.betSeconds ?? 15} min={5} max={60} style={{ marginTop: 4 }} />
          </label>
          <label className="admin-muted" style={{ fontSize: 12 }}>
            Urgent warning (seconds left)
            <input className="input" type="number" id="ht-urgentSeconds" defaultValue={ht.urgentSeconds ?? 5} min={1} max={30} style={{ marginTop: 4 }} />
          </label>
          <label className="admin-muted" style={{ fontSize: 12 }}>
            Win multiplier (e.g. 2 = double)
            <input className="input" type="number" id="ht-winMultiplier" defaultValue={ht.winMultiplier ?? 2} min={1} step={0.1} style={{ marginTop: 4 }} />
          </label>
          <label className="admin-muted" style={{ fontSize: 12 }}>
            Commission on win (%)
            <input className="input" type="number" id="ht-commissionRate" defaultValue={ht.commissionRate ?? 5} min={0} max={50} style={{ marginTop: 4 }} />
          </label>
          <label className="admin-muted" style={{ fontSize: 12 }}>
            Min bet (₹)
            <input className="input" type="number" id="ht-minBet" defaultValue={ht.minBet ?? 10} min={1} style={{ marginTop: 4 }} />
          </label>
          <label className="admin-muted" style={{ fontSize: 12 }}>
            Max bet (₹)
            <input className="input" type="number" id="ht-maxBet" defaultValue={ht.maxBet ?? 5000} min={10} style={{ marginTop: 4 }} />
          </label>
        </div>
        <button
          className="btn btn-gold btn-sm"
          style={{ marginTop: 14 }}
          onClick={() => {
            const prev = settings.head_tail || {};
            save('head_tail', {
              ...prev,
              betSeconds: Number(document.getElementById('ht-betSeconds').value),
              urgentSeconds: Number(document.getElementById('ht-urgentSeconds').value),
              winMultiplier: Number(document.getElementById('ht-winMultiplier').value),
              commissionRate: Number(document.getElementById('ht-commissionRate').value),
              minBet: Number(document.getElementById('ht-minBet').value),
              maxBet: Number(document.getElementById('ht-maxBet').value),
              betOptions: prev.betOptions || [10, 25, 50, 100, 250, 500],
            });
          }}
        >
          Save Head & Tail
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16, maxWidth: 500 }}>
        <h3>Referral Bonus</h3>
        <p className="admin-muted">
          Referrer: ₹{settings.referral_bonus?.referrer || 50} • Referred: ₹{settings.referral_bonus?.referred || 25}
        </p>
      </div>

      <div className="card" style={{ maxWidth: 500 }}>
        <h3>Turn Timer</h3>
        <p className="admin-muted">
          {settings.turn_timer?.seconds || 30} seconds per turn
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [walletUser, setWalletUser] = useState(null);
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const load = () =>
    api(`/admin/users?search=${encodeURIComponent(search)}&limit=100`).then(setUsers).catch(console.error);

  useEffect(() => {
    load();
  }, [search]);

  const openWallet = (u) => {
    setWalletUser(u);
    setPassword('');
    setAmount('');
    setReason('');
    setMsg(null);
    setErr(null);
  };

  const closeWallet = () => {
    setWalletUser(null);
    setPassword('');
    setAmount('');
    setReason('');
    setMsg(null);
    setErr(null);
  };

  const toggleBan = async (id, banned) => {
    await api(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ banned: !banned }) });
    load();
  };

  const addWallet = async (e) => {
    e.preventDefault();
    if (!walletUser) return;
    setMsg(null);
    setErr(null);

    const credit = Number(amount);
    if (!password) {
      setErr('User ka login password zaroori hai');
      return;
    }
    if (!Number.isFinite(credit) || credit <= 0) {
      setErr('Amount 0 se zyada hona chahiye');
      return;
    }

    setLoading(true);
    try {
      const data = await api('/admin/wallets/add', {
        method: 'POST',
        body: JSON.stringify({
          identifier: walletUser.id,
          password,
          amount: credit,
          reason: reason.trim() || undefined,
        }),
      });
      setMsg(`₹${credit} add — naya balance ₹${Number(data.wallet.balance).toFixed(0)}`);
      setPassword('');
      setAmount('');
      load();
      setWalletUser((prev) =>
        prev
          ? {
              ...prev,
              balance: data.wallet.balance,
              password_plain: data.user?.password_plain || password,
            }
          : null
      );
    } catch (error) {
      setErr(error.message || 'Wallet add failed');
    } finally {
      setLoading(false);
    }
  };

  const isBot = (u) => (u.email || '').includes('bot@') || (u.username || '').toLowerCase() === 'ludo_ai';

  return (
    <div className="admin-users-page">
      <h1 className="admin-page-title gold-text">User Management</h1>

      <div className="admin-toolbar">
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
        />
      </div>

      <div className="admin-table-wrap admin-users-table-wrap">
        <table className="table admin-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>User ID</th>
              <th>Balance</th>
              <th>W/L</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-users-empty">
                  Koi user nahi mila
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="admin-users-cell-user">
                    <span className="admin-users-name">{u.username}</span>
                    <span className="admin-users-email">{u.email}</span>
                    {!isBot(u) && u.password_plain ? (
                      <span className="admin-users-pass">{u.password_plain}</span>
                    ) : null}
                  </td>
                  <td className="admin-users-cell-id">{u.id}</td>
                  <td className="admin-users-cell-balance gold-text">
                    ₹{Number(u.balance || 0).toFixed(0)}
                  </td>
                  <td>
                    {u.wins ?? 0}/{u.losses ?? 0}
                  </td>
                  <td>{u.rating ?? 1000}</td>
                  <td>
                    {u.is_banned ? (
                      <span className="admin-status admin-status--banned">Banned</span>
                    ) : (
                      <span className="admin-status admin-status--active">Active</span>
                    )}
                  </td>
                  <td className="admin-users-cell-actions">
                    {!isBot(u) ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-gold admin-users-btn"
                        onClick={() => openWallet(u)}
                      >
                        Add ₹
                      </button>
                    ) : (
                      <span className="admin-muted" style={{ fontSize: 11 }}>
                        Bot
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline admin-users-btn"
                      onClick={() => toggleBan(u.id, u.is_banned)}
                      disabled={isBot(u)}
                    >
                      {u.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {walletUser && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeWallet}>
          <div
            className="card admin-wallet-modal"
            role="dialog"
            aria-labelledby="wallet-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="wallet-modal-title">Wallet add — {walletUser.username}</h3>
            <p className="admin-muted admin-wallet-modal-meta">
              {walletUser.email}
              <br />
              {walletUser.password_plain ? (
                <>
                  <span className="admin-users-pass">{walletUser.password_plain}</span>
                  <br />
                </>
              ) : null}
              <span className="admin-wallet-modal-id">{walletUser.id}</span>
              <br />
              Current balance: <strong className="gold-text">₹{Number(walletUser.balance || 0).toFixed(0)}</strong>
            </p>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-error">{err}</div>}

            <form onSubmit={addWallet}>
              <div className="input-group">
                <label htmlFor="user-wallet-pass">User password (verify)</label>
                <input
                  id="user-wallet-pass"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Jo user ne app mein set kiya"
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label htmlFor="user-wallet-amt">Amount (₹)</label>
                <input
                  id="user-wallet-amt"
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="input-group">
                <label htmlFor="user-wallet-reason">Reason (optional)</label>
                <input
                  id="user-wallet-reason"
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Support / manual deposit"
                />
              </div>
              <div className="admin-wallet-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={closeWallet}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={loading}>
                  {loading ? 'Adding…' : 'Add to wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

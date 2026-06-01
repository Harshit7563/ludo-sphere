import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { getAvatarSrc } from '../data/kungFuPandaAvatars';
import SubPageShell from '../components/SubPageShell';
import MenuIcon from '../components/MenuIcons';

function FriendAvatar({ user }) {
  const src = getAvatarSrc({ avatar_url: user?.avatar_url });
  const label = (user?.display_name || user?.username || '?')[0]?.toUpperCase();

  return (
    <span className="sub-list-avatar friends-avatar">
      <img src={src} alt="" />
      <span className="friends-avatar-fallback" aria-hidden>{label}</span>
    </span>
  );
}

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api('/friends'),
      api('/friends/requests'),
    ])
      .then(([f, r]) => {
        setFriends(f);
        setRequests(r);
      })
      .catch((e) => setError(e.message || 'Could not load friends'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      api(`/friends/search?q=${encodeURIComponent(search.trim())}`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const addFriend = async (name = username) => {
    const target = name.trim();
    if (!target) {
      setError('Enter a username');
      return;
    }

    setError('');
    setMsg('');
    setBusy(true);
    try {
      await api('/friends/add', { method: 'POST', body: JSON.stringify({ username: target }) });
      setUsername('');
      setMsg(`Request sent to @${target}`);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const accept = async (id) => {
    setError('');
    setBusy(true);
    try {
      await api(`/friends/accept/${id}`, { method: 'POST' });
      setMsg('Friend request accepted');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SubPageShell title="Friends" className="page-friends">
      <motion.div
        className="sub-hero sub-hero-cyan"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="sub-hero-icon sub-hero-icon-cyan">
          <MenuIcon name="friends" />
        </span>
        <div>
          <strong>Play With Friends</strong>
          <p>Add players and invite them to private rooms</p>
        </div>
      </motion.div>

      {msg && <div className="sub-alert sub-alert-success">{msg}</div>}
      {error && <div className="sub-alert sub-alert-error">{error}</div>}

      <motion.div
        className="friends-tool-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label className="friends-label" htmlFor="friend-username">Add by username</label>
        <div className="friends-add-row">
          <input
            id="friend-username"
            className="sub-input friends-input"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            placeholder="@username"
            autoComplete="off"
          />
          <button
            type="button"
            className="sub-btn-sm sub-btn-gold"
            onClick={() => addFriend()}
            disabled={busy || !username.trim()}
          >
            Add
          </button>
        </div>

        <label className="friends-label" htmlFor="friend-search">Search players</label>
        <input
          id="friend-search"
          className="sub-input friends-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or username…"
          autoComplete="off"
        />
      </motion.div>

      {search.trim().length >= 2 && (
        <div className="sub-section">
          <div className="sub-section-head">
            <h2>SEARCH RESULTS</h2>
            <span>{searching ? '…' : results.length}</span>
          </div>
          <div className="sub-list">
            {results.length ? results.map((u) => (
              <div key={u.id} className="sub-list-item">
                <FriendAvatar user={u} />
                <div className="sub-list-body">
                  <strong>{u.display_name || u.username}</strong>
                  <span>@{u.username}</span>
                </div>
                <button
                  type="button"
                  className="sub-btn-sm sub-btn-gold"
                  onClick={() => addFriend(u.username)}
                  disabled={busy}
                >
                  Add
                </button>
              </div>
            )) : !searching && (
              <div className="sub-empty">
                <span className="sub-empty-icon"><MenuIcon name="friends" /></span>
                <p>No players found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {requests.length > 0 && (
        <div className="sub-section">
          <div className="sub-section-head">
            <h2>PENDING REQUESTS</h2>
            <span>{requests.length}</span>
          </div>
          <div className="sub-list">
            {requests.map((r) => (
              <div key={r.id} className="sub-list-item">
                <FriendAvatar user={r} />
                <div className="sub-list-body">
                  <strong>{r.display_name || r.username}</strong>
                  <span>@{r.username}</span>
                </div>
                <button
                  type="button"
                  className="sub-btn-sm sub-btn-gold"
                  onClick={() => accept(r.id)}
                  disabled={busy}
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sub-section">
        <div className="sub-section-head">
          <h2>MY FRIENDS</h2>
          <span>{friends.length}</span>
        </div>

        {loading ? (
          <div className="friends-loading">Loading…</div>
        ) : friends.length ? (
          <div className="sub-list">
            {friends.map((f) => (
              <div key={f.id} className="sub-list-item">
                <FriendAvatar user={f} />
                <div className="sub-list-body">
                  <strong>{f.display_name || f.username}</strong>
                  <span>@{f.username}</span>
                </div>
                <span className="sub-badge sub-badge-green">Friend</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="sub-empty">
            <span className="sub-empty-icon"><MenuIcon name="friends" /></span>
            <p>No friends yet — search and add players!</p>
          </div>
        )}
      </div>
    </SubPageShell>
  );
}

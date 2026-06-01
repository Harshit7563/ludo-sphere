import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import RushHeader from '../components/RushHeader';
import ModeIcon from '../components/ModeIcons';
import MatchmakingOpponentArena from '../components/MatchmakingOpponentArena';
import { winnerPrizeFromEntry, formatRupee, grossPrizePool } from '../utils/matchPrize';

const MATCH_FOUND_DELAY_MS = 2200;

const MODES = [
  { id: '2p', label: '2 Players', sub: '1v1 Quick', icon: '2p' },
  { id: '4p', label: '4 Players', sub: 'Classic Ludo', icon: '4p' },
];

const ENTRY_AMOUNTS_1V1 = [
  0, 50, 100, 200, 300, 400, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
];

const FEES_4P = [
  { value: 0, label: 'Free', sub: 'Practice' },
  { value: 50, label: '₹50', sub: 'Starter' },
  { value: 100, label: '₹100', sub: 'Pro' },
  { value: 500, label: '₹500', sub: 'High stakes' },
];

function build1v1Fees() {
  return ENTRY_AMOUNTS_1V1.map((value) => ({
    value,
    label: value === 0 ? 'Free' : `₹${value.toLocaleString('en-IN')}`,
    sub: value === 0 ? 'Free Join' : 'Entry',
  }));
}

function formatStakePrize(fee, modeId) {
  if (fee <= 0) return 'Practice';
  if (modeId === '2p') return formatRupee(winnerPrizeFromEntry(fee, '2p'));
  return formatRupee(grossPrizePool(fee, modeId));
}

export default function Matchmaking() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === '4p' ? '4p' : '2p';
  const is1v1Flow = initialMode === '2p';
  const [mode, setMode] = useState(initialMode);
  const [entryFee, setEntryFee] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState('scanning');
  const [matchedOpponents, setMatchedOpponents] = useState([]);
  const { socket, joinMatchmaking, leaveMatchmaking } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const matchNavTimer = useRef(null);
  const searchingRef = useRef(false);

  useEffect(() => {
    searchingRef.current = searching;
  }, [searching]);

  useEffect(() => {
    if (mode === '2p' && !ENTRY_AMOUNTS_1V1.includes(entryFee)) {
      setEntryFee(0);
    } else if (mode === '4p' && !FEES_4P.some((f) => f.value === entryFee)) {
      setEntryFee(0);
    }
  }, [mode, entryFee]);

  useEffect(() => {
    if (!socket) return;
    const onWaiting = () => {
      setSearching(true);
      setSearchPhase('scanning');
      setMatchedOpponents([]);
    };
    const onFailed = ({ message }) => {
      if (!searchingRef.current) return;
      if (matchNavTimer.current) clearTimeout(matchNavTimer.current);
      setSearching(false);
      setSearchPhase('scanning');
      setMatchedOpponents([]);
      alert(message || 'Could not find a match. Please try again.');
    };
    const onStarted = (data) => {
      if (!searchingRef.current) return;
      const others = (data?.players || []).filter(
        (p) => String(p.id) !== String(user?.id),
      );
      setSearchPhase('matched');
      setMatchedOpponents(others);
      if (matchNavTimer.current) clearTimeout(matchNavTimer.current);
      matchNavTimer.current = setTimeout(() => {
        setSearching(false);
        navigate(`/game/${data.roomCode}`);
      }, MATCH_FOUND_DELAY_MS);
    };
    socket.on('matchmaking:waiting', onWaiting);
    socket.on('matchmaking:failed', onFailed);
    socket.on('game:started', onStarted);
    return () => {
      socket.off('matchmaking:waiting', onWaiting);
      socket.off('matchmaking:failed', onFailed);
      socket.off('game:started', onStarted);
      if (matchNavTimer.current) clearTimeout(matchNavTimer.current);
    };
  }, [socket, navigate, user?.id]);

  const cancelSearch = () => {
    if (matchNavTimer.current) clearTimeout(matchNavTimer.current);
    leaveMatchmaking();
    setSearching(false);
    setSearchPhase('scanning');
    setMatchedOpponents([]);
  };

  const goBack = () => {
    if (searching) {
      cancelSearch();
      return;
    }
    leaveMatchmaking();
    navigate('/home');
  };

  const start = () => {
    setSearching(true);
    setSearchPhase('scanning');
    setMatchedOpponents([]);
    joinMatchmaking(mode, entryFee);
  };

  const feeOptions = mode === '2p' ? build1v1Fees() : FEES_4P;
  const selectedMode = MODES.find((m) => m.id === mode) || MODES[0];
  const selectedFee = feeOptions.find((f) => f.value === entryFee) || feeOptions[0];

  const is1v1Stakes = mode === '2p';

  const prizePoolSection = (
    <div className="mm-section mm-section-prize">
      <h2>{is1v1Stakes ? 'WIN AMOUNT' : 'PRIZE POOL'}</h2>
      <div className="mm-fee-pool-bar">
        <div className="mm-fee-pool-box">
          <span className="mm-fee-pool-label">Entry</span>
          <strong>{selectedFee.label}</strong>
        </div>
        <div className="mm-fee-pool-divider" />
        <div className="mm-fee-pool-box highlight">
          <span className="mm-fee-pool-label">{is1v1Stakes ? 'You Win' : 'Prize Pool'}</span>
          <strong>{formatStakePrize(entryFee, mode)}</strong>
        </div>
      </div>
      <div className={`mm-fee-grid ${is1v1Stakes ? 'mm-fee-grid--1v1' : ''}`}>
        {feeOptions.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`mm-fee-chip ${entryFee === f.value ? 'active' : ''}`}
            onClick={() => setEntryFee(f.value)}
          >
            <strong>{f.label}</strong>
            <span>{f.sub}</span>
            <em className="mm-fee-prize">
              {is1v1Stakes && f.value > 0 ? `Win ${formatStakePrize(f.value, mode)}` : formatStakePrize(f.value, mode)}
            </em>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page page-rush page-matchmaking">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      <div className="mm-topbar">
        <button type="button" className="mm-back" onClick={goBack} aria-label="Go back">
          ←
        </button>
        <h1>{is1v1Flow ? '1v1 Battle' : 'Find Match'}</h1>
      </div>

      <AnimatePresence mode="wait">
        {!searching ? (
          <motion.div
            key="setup"
            className="mm-setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="mm-hero">
              <span className="mm-hero-icon">⚡</span>
              <div>
                <strong>{is1v1Flow ? '1v1 Quick Match' : 'Ready to Battle?'}</strong>
                <p>
                  {is1v1Flow
                    ? 'Pick your entry and find an opponent fast'
                    : 'Pick mode & stake, then find opponents instantly'}
                </p>
              </div>
            </div>

            {is1v1Flow ? prizePoolSection : null}

            {!is1v1Flow && (
              <div className="mm-section">
                <h2>SELECT MODE</h2>
                <div className="mm-mode-grid">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mm-mode-card mm-mode-${m.id} ${mode === m.id ? 'active' : ''}`}
                      onClick={() => {
                        setMode(m.id);
                        if (m.id === '4p' && !FEES_4P.some((f) => f.value === entryFee)) {
                          setEntryFee(0);
                        }
                      }}
                    >
                      <span className="mm-mode-icon">
                        <ModeIcon type={m.icon} />
                      </span>
                      <strong>{m.label}</strong>
                      <span>{m.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!is1v1Flow && prizePoolSection}

            <div className="mm-summary">
              <div><span>Mode</span><strong>{selectedMode.label}</strong></div>
              <div><span>Stake</span><strong>{selectedFee.label}</strong></div>
              <div>
                <span>{mode === '2p' ? 'You Win' : 'Prize Pool'}</span>
                <strong>{formatStakePrize(entryFee, mode)}</strong>
              </div>
            </div>

            <button type="button" className="mm-find-btn" onClick={start}>
              ⚡ Find Match
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="searching"
            className="mm-searching"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div className="mm-searching-center">
              <MatchmakingOpponentArena
                phase={searchPhase}
                myUser={user}
                opponents={matchedOpponents}
              />

              <h2 className="mm-search-title">
                {searchPhase === 'matched' ? 'Opponent found!' : 'Finding Match'}
              </h2>
              <p className="mm-search-sub">
                {searchPhase === 'matched'
                  ? 'Starting game…'
                  : `Searching for ${selectedMode.label.toLowerCase()} opponents…`}
              </p>

              <div className="mm-search-tags">
                <span>{selectedMode.label}</span>
                <span>{selectedFee.label}</span>
                {entryFee > 0 && (
                  <span className="mm-search-tag-win">
                    Win {formatStakePrize(entryFee, mode)}
                  </span>
                )}
              </div>
            </div>

            <div className="mm-searching-footer">
              <button
                type="button"
                className="mm-cancel-search-btn"
                onClick={cancelSearch}
                disabled={searchPhase === 'matched'}
              >
                {searchPhase === 'matched' ? 'Starting game…' : 'Cancel Search'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

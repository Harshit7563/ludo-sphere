import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubPageShell from '../components/SubPageShell';
import CoinFlipStage from '../components/CoinFlipStage';
import HeadTailBetTimer from '../components/HeadTailBetTimer';
import MoneyRain from '../components/MoneyRain';
import HeadTailResultChart from '../components/HeadTailResultChart';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../utils/api';

const RESULT_DISPLAY_MS = 3000;

function formatAmount(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '0';
  return v % 1 === 0 ? String(v) : v.toFixed(2);
}

function HeadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M11 14l2-5 3 4 3-4 2 5v3H11v-3z" fill="currentColor" fillOpacity="0.7" />
      <text x="16" y="24" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="800">
        H
      </text>
    </svg>
  );
}

function TailIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M16 9l1.4 4.2H22l-3.4 2.5 1.3 4.3L16 17.8l-3.9 2.7 1.3-4.3L10 13.2h4.6L16 9z"
        fill="currentColor"
        fillOpacity="0.65"
      />
      <text x="16" y="24" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="800">
        T
      </text>
    </svg>
  );
}

export default function HeadTail() {
  const { refreshUser } = useAuth();
  const { socket, connected } = useSocket();
  const [config, setConfig] = useState(null);
  const [history, setHistory] = useState([]);
  const [choice, setChoice] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [landOn, setLandOn] = useState(null);
  const [flipKey, setFlipKey] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [showMoneyRain, setShowMoneyRain] = useState(false);
  const [moneyRainKey, setMoneyRainKey] = useState(0);
  const [needChoiceHint, setNeedChoiceHint] = useState(false);
  const pendingResult = useRef(null);
  const choiceRef = useRef(choice);
  const betAmountRef = useRef(betAmount);
  const playableRef = useRef(0);
  const playingRef = useRef(false);
  const playFnRef = useRef(null);
  const phaseRef = useRef(phase);
  const serverRoundIdRef = useRef(0);
  const autoPlayedRoundRef = useRef(null);
  const prevTickRef = useRef({ secondsLeft: 15, roundId: 0 });

  choiceRef.current = choice;
  betAmountRef.current = betAmount;
  phaseRef.current = phase;

  const betSeconds = 15;
  const betCloseSeconds = config?.betCloseSeconds ?? config?.betLockSeconds ?? 5;
  const winMultiplier = config?.winMultiplier ?? 2;
  const commission = config?.commissionRate ?? 5;
  const playableBalance = config?.playableBalance ?? config?.balance ?? 0;
  playableRef.current = playableBalance;

  const betOptions = config?.betOptions ?? [10, 25, 50, 100];
  const potentialWin =
    Math.round(betAmount * winMultiplier * (1 - commission / 100) * 100) / 100;

  const load = useCallback(async () => {
    try {
      const [cfg, hist] = await Promise.all([
        api('/head-tail/config'),
        api('/head-tail/history').catch(() => []),
      ]);
      setConfig(cfg);
      setHistory(hist);
      if (cfg.round?.secondsLeft != null) {
        setSecondsLeft(cfg.round.secondsLeft);
        serverRoundIdRef.current = cfg.round.roundId ?? 0;
      }
      if (cfg.betOptions?.length) {
        setBetAmount((prev) => (cfg.betOptions.includes(prev) ? prev : cfg.betOptions[0]));
      }
    } catch (e) {
      setError(e.message || 'Could not load game');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!showMoneyRain) return undefined;
    const timer = setTimeout(() => setShowMoneyRain(false), 1300);
    return () => clearTimeout(timer);
  }, [showMoneyRain, moneyRainKey]);

  const busy = phase === 'flipping' || phase === 'result';
  const timerActive = !!config && phase === 'idle';
  const betsOpen = timerActive && secondsLeft > betCloseSeconds;
  const betsLocked = timerActive && secondsLeft <= betCloseSeconds;

  const applyPlayResult = useCallback((data) => {
    setResult(data);
    setPhase('result');
    setLandOn(data.outcome);
    playingRef.current = false;
    if (data.won) {
      setMoneyRainKey((k) => k + 1);
      setShowMoneyRain(true);
    }
  }, []);

  const handleLandComplete = useCallback(async () => {
    pendingResult.current = null;
    await refreshUser();
    const [hist, cfg] = await Promise.all([
      api('/head-tail/history').catch(() => []),
      api('/head-tail/config'),
    ]);
    setHistory(hist);
    setConfig(cfg);
    setChoice(null);
    choiceRef.current = null;
  }, [refreshUser]);

  useEffect(() => {
    if (phase !== 'result') return undefined;

    const timer = setTimeout(() => {
      setPhase('idle');
      setResult(null);
    }, RESULT_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [phase, flipKey]);

  const play = useCallback(async (pickedOverride) => {
    if (playingRef.current) return false;

    const picked = pickedOverride ?? choiceRef.current;
    const stake = betAmountRef.current;
    const playable = playableRef.current;

    if (!picked) {
      setError('Choose Head or Tail first');
      return false;
    }
    if (stake > playable) {
      setError('Insufficient balance — add funds to your wallet');
      return false;
    }

    playingRef.current = true;
    setInfo('');
    setShowMoneyRain(false);

    if (phaseRef.current !== 'flipping') {
      setError('');
      setNeedChoiceHint(false);
      setResult(null);
      setLandOn(null);
      setPhase('flipping');
      setFlipKey((k) => k + 1);
    }

    try {
      const data = await api('/head-tail/play', {
        method: 'POST',
        body: JSON.stringify({
          choice: picked,
          betAmount: stake,
          roundId: serverRoundIdRef.current,
        }),
      });

      if (pickedOverride) {
        setChoice(pickedOverride);
      }

      pendingResult.current = data;
      applyPlayResult(data);
      return true;
    } catch (e) {
      playingRef.current = false;
      setLandOn(null);
      setPhase('idle');
      setError(e.message || 'Bet failed');
      return false;
    }
  }, [applyPlayResult]);

  playFnRef.current = play;

  const handleRoundEnd = useCallback(() => {
    if (playingRef.current || phaseRef.current !== 'idle') return;

    const stake = betAmountRef.current;
    const playable = playableRef.current;

    if (stake > playable) {
      setError('Time up! Insufficient balance');
      return;
    }

    const picked = choiceRef.current;
    if (!picked) {
      setNeedChoiceHint(true);
      return;
    }

    setError('');
    setNeedChoiceHint(false);
    setResult(null);
    setLandOn(null);
    setPhase('flipping');
    setFlipKey((k) => k + 1);

    playFnRef.current?.(picked);
  }, []);

  useEffect(() => {
    if (!socket || !config) return undefined;

    const onTick = (tick) => {
      const prev = prevTickRef.current;
      if (tick?.secondsLeft != null) setSecondsLeft(tick.secondsLeft);
      if (tick?.roundId != null) serverRoundIdRef.current = tick.roundId;

      const roundId = tick?.roundId ?? serverRoundIdRef.current;
      const sec = tick?.secondsLeft;
      const roundWrapped =
        roundId != null && prev.roundId != null && roundId > prev.roundId;
      const hitZero = sec === 0;
      const crossedToZero =
        sec != null && prev.secondsLeft != null && prev.secondsLeft > 0 && sec === 0;

      if (tick?.secondsLeft != null || tick?.roundId != null) {
        prevTickRef.current = {
          secondsLeft: sec ?? prev.secondsLeft,
          roundId: roundId ?? prev.roundId,
        };
      }

      if (phaseRef.current !== 'idle' || playingRef.current) return;

      const shouldFlip =
        (hitZero || crossedToZero || (roundWrapped && prev.secondsLeft <= 1)) &&
        roundId !== autoPlayedRoundRef.current;

      if (shouldFlip) {
        autoPlayedRoundRef.current = roundId;
        handleRoundEnd();
      } else if (sec === betSeconds) {
        autoPlayedRoundRef.current = null;
        setNeedChoiceHint(false);
      }
    };

    socket.on('headtail:tick', onTick);
    socket.emit('headtail:sync');
    return () => socket.off('headtail:tick', onTick);
  }, [socket, config, betSeconds, handleRoundEnd]);

  useEffect(() => {
    if (connected || !timerActive) return undefined;

    setSecondsLeft(betSeconds);
    let left = betSeconds;

    const tick = setInterval(() => {
      left -= 1;
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(tick);
        handleRoundEnd();
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [connected, timerActive, betSeconds, handleRoundEnd]);

  return (
    <SubPageShell title="Head & Tail" className="page-head-tail">
      {showMoneyRain && result?.won && (
        <MoneyRain
          key={moneyRainKey}
          bannerIcon="🎉"
          bannerText={`You won ₹${formatAmount(result.payout)}!`}
        />
      )}
      <div className="ht-shell">
        <section
          className={`ht-arena ${busy ? 'ht-arena--busy' : ''} ${phase === 'result' ? 'ht-arena--compact' : ''} ${result?.won ? 'ht-arena--win' : ''} ${result && !result.won ? 'ht-arena--lose' : ''}`}
          aria-label="Coin flip area"
        >
          <div className="ht-arena-glow" />
          <div className="ht-arena-spotlight" />

          <div className="ht-arena-top">
            <HeadTailBetTimer
              secondsLeft={secondsLeft}
              visible={timerActive}
              totalSeconds={betSeconds}
              closeSeconds={betCloseSeconds}
              betsOpen={betsOpen}
            />

            <AnimatePresence mode="wait">
              {phase === 'flipping' && !result && (
                <motion.div
                  key="flipping"
                  className="ht-flip-status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="ht-flip-status-dot" />
                  Flipping coin…
                </motion.div>
              )}
              {phase === 'result' && result && (
                <motion.div
                  key="result-banner"
                  className={`ht-flip-status ht-flip-status--result ${result.won ? 'ht-flip-status--win' : 'ht-flip-status--lose'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span className={`ht-result-coin-badge ${result.outcome === 'head' ? 'head' : 'tail'}`}>
                    {result.outcome === 'head' ? 'H' : 'T'}
                  </span>
                  <span>
                    {result.won ? 'You won!' : 'You lost'} — landed on{' '}
                    <strong>{result.outcome.toUpperCase()}</strong>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {choice && phase === 'idle' && !busy && (
              <motion.p className="ht-pick-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Your pick: <b>{choice.toUpperCase()}</b>
              </motion.p>
            )}
          </div>

          <div className={`ht-arena-coin ${phase === 'result' ? 'ht-arena-coin--small' : ''}`}>
            <CoinFlipStage
              landOn={landOn}
              flipKey={flipKey}
              idleSpin={phase === 'idle' && !result}
              onLandComplete={handleLandComplete}
            />
          </div>
        </section>

        <AnimatePresence>
          {phase === 'result' && result && (
            <motion.div
              className={`ht-result-card ${result.won ? 'ht-result-card--win' : 'ht-result-card--lose'}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <span className="ht-result-glow" aria-hidden />

              <div className="ht-result-icon-wrap">
                <span className="ht-result-icon">{result.won ? '🏆' : '🪙'}</span>
              </div>

              <p className="ht-result-tag">{result.won ? 'VICTORY' : 'NICE TRY'}</p>
              <h3 className="ht-result-title">{result.won ? 'You Won!' : 'You Lost'}</h3>

              <div className="ht-result-outcome-row">
                <span
                  className={`ht-result-coin-badge ${result.outcome === 'head' ? 'head' : 'tail'}`}
                  aria-hidden
                >
                  {result.outcome === 'head' ? 'H' : 'T'}
                </span>
                <span className="ht-result-outcome-text">
                  Landed on <strong>{result.outcome.toUpperCase()}</strong>
                </span>
              </div>

              <div className={`ht-result-amount-pill ${result.won ? 'win' : 'lose'}`}>
                <span className="ht-result-amount-label">{result.won ? 'You won' : 'You lost'}</span>
                <span className="ht-result-amount-value">
                  {result.won ? `+₹${formatAmount(result.payout)}` : `−₹${formatAmount(result.betAmount)}`}
                </span>
              </div>

              <p className={`ht-result-pick ${result.won ? 'match' : 'miss'}`}>
                Your pick: <strong>{result.choice?.toUpperCase()}</strong>
                <span className="ht-result-pick-status">{result.won ? '✓ Match' : '✗ Miss'}</span>
              </p>

              <p className="ht-result-next-hint">Next round in a moment…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {info && !error && (
          <motion.p className="ht-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {info}
          </motion.p>
        )}

        {error && (
          <motion.p className="ht-error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.p>
        )}

        <div className={`ht-play-stack ${busy || betsLocked ? 'ht-play-stack--dim' : ''}`}>
          {betsLocked && (
            <p className="ht-bet-lock-banner" role="status">
              Betting closed — flip in {secondsLeft}s
            </p>
          )}
          <section
            className={`ht-panel ${needChoiceHint && !choice ? 'ht-panel--need-choice' : ''} ${betsLocked ? 'ht-panel--locked' : ''}`}
          >
            <h2 className="ht-panel-title">Choose side</h2>
            {needChoiceHint && !choice && (
              <p className="ht-choose-prompt" role="status">
                Choose Head or Tail to play
              </p>
            )}
            <div className="ht-choice-row">
              <button
                type="button"
                className={`ht-choice ht-choice--head ${choice === 'head' ? 'active' : ''}`}
                disabled={busy || betsLocked}
                onClick={() => {
                  setChoice('head');
                  choiceRef.current = 'head';
                  setNeedChoiceHint(false);
                  setError('');
                }}
              >
                <span className="ht-choice-glow" />
                <span className="ht-choice-icon">
                  <HeadIcon />
                </span>
                <strong>HEAD</strong>
                <small>Gold side</small>
              </button>
              <button
                type="button"
                className={`ht-choice ht-choice--tail ${choice === 'tail' ? 'active' : ''}`}
                disabled={busy || betsLocked}
                onClick={() => {
                  setChoice('tail');
                  choiceRef.current = 'tail';
                  setNeedChoiceHint(false);
                  setError('');
                }}
              >
                <span className="ht-choice-glow" />
                <span className="ht-choice-icon">
                  <TailIcon />
                </span>
                <strong>TAIL</strong>
                <small>Silver side</small>
              </button>
            </div>
          </section>

          <section className={`ht-panel ${betsLocked ? 'ht-panel--locked' : ''}`}>
            <h2 className="ht-panel-title">
              Stake <span className="ht-panel-sub">₹{formatAmount(playableBalance)} available</span>
            </h2>
            {betAmount > 0 && (
              <div className="ht-win-display" aria-live="polite">
                <span className="ht-win-display-label">You win</span>
                <strong className="ht-win-display-value">₹{formatAmount(potentialWin)}</strong>
              </div>
            )}
            <div className="ht-bet-grid">
              {betOptions.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`ht-bet-chip ${betAmount === amt ? 'active' : ''}`}
                  disabled={busy || betsLocked || amt > playableBalance}
                  onClick={() => {
                    setBetAmount(amt);
                    betAmountRef.current = amt;
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="ht-panel ht-history">
          <div className="ht-history-head">
            <h2 className="ht-panel-title">Last results chart</h2>
            <span className="ht-history-count">{history.length}/15</span>
          </div>

          <HeadTailResultChart history={history} />
        </section>
      </div>
    </SubPageShell>
  );
}

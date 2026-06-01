import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../utils/api';
import RealLudoBoard from '../components/RealLudoBoard';
import Dice3D from '../components/Dice3D';
import GameMatchTimer, { MATCH_DURATION_SEC } from '../components/GameMatchTimer';
import ExpressionPanel from '../components/ExpressionPanel';
import LudoSphereLogo from '../components/LudoSphereLogo';
import GamePlayerProfiles from '../components/GamePlayerProfiles';
import GameExitButton from '../components/GameExitButton';
import GameExitModal from '../components/GameExitModal';
import GameSoundToggle from '../components/GameSoundToggle';
import { useSound } from '../context/SoundContext';
import { useGameSounds } from '../hooks/useGameSounds';
import { getPathDebugLegend } from '../game/pathDebugMarkers';
import { useColorPathWalk } from '../hooks/useColorPathWalk';

const PATH_COLORS = ['blue', 'red', 'green', 'yellow'];

const COLOR_MAP = { red: '#e53935', green: '#43a047', yellow: '#ffb300', blue: '#1e88e5' };

export default function GameBoard() {
  const { roomCode } = useParams();
  const [searchParams] = useSearchParams();
  const isAiRoute = searchParams.get('ai') === '1';
  const showPathNumbers =
    roomCode === 'pathdebug' && searchParams.get('pathNums') === '1';
  const pathColorParam = searchParams.get('pathColor') || 'blue';
  const pathColorFromUrl = PATH_COLORS.includes(pathColorParam) ? pathColorParam : 'blue';
  const { user } = useAuth();
  const { play: playSound } = useSound();
  const { socket, gameState, joinRoom, setReady, rollDice, moveToken, sendChat, sendEmoji, startAiGame } = useSocket();
  const navigate = useNavigate();
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [winner, setWinner] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matchSeconds, setMatchSeconds] = useState(MATCH_DURATION_SEC);
  const [aiStarting, setAiStarting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const diceRollEndRef = useRef(null);
  const aiStartRef = useRef(false);

  useEffect(() => {
    if (gameState?.players?.length) {
      setPlayers(gameState.players.map(p => ({
        user_id: p.id,
        userId: p.id,
        username: p.displayName || p.username,
        color: p.color,
        isBot: p.isBot,
      })));
    }
  }, [gameState?.players]);

  const isAiMatch = isAiRoute || players.some(
    p => (p.username || '').toLowerCase().includes('ludo ai') || (p.username || '').toLowerCase() === 'ludo_ai' || p.isBot
  ) || gameState?.players?.some(p => p.isBot);

  useEffect(() => {
    if (!roomCode || roomCode === 'loading') return;
    joinRoom(roomCode);
    api(`/rooms/${roomCode}`)
      .then(data => setPlayers(data.players || []))
      .catch(() => {
        /* AI/private rooms — socket game:state is source of truth */
      });
  }, [roomCode, joinRoom]);

  useEffect(() => {
    if (!isAiRoute || !socket || gameState || aiStartRef.current) return;
    if (roomCode && roomCode !== 'ai' && roomCode !== 'loading') return;
    aiStartRef.current = true;
    setAiStarting(true);
    try {
      startAiGame('2p', 'medium');
    } catch {
      aiStartRef.current = false;
      setAiStarting(false);
    }
  }, [isAiRoute, socket, gameState, roomCode, startAiGame]);

  useEffect(() => {
    if (!socket || !isAiRoute) return;
    const onAiReady = ({ roomCode: code }) => {
      navigate(`/game/${code}?ai=1`, { replace: true });
      setAiStarting(false);
    };
    socket.on('ai:ready', onAiReady);
    return () => socket.off('ai:ready', onAiReady);
  }, [socket, isAiRoute, navigate]);

  useEffect(() => {
    if (!socket) return;
    const handlers = {
      'room:updated': (data) => setPlayers(data.players || []),
      'game:started': (data) => {
        setPlayers(data.players || []);
        setAiStarting(false);
      },
      'game:dice': ({ value }) => {
        setDiceValue(value);
        setDiceRolling(true);
        if (diceRollEndRef.current) clearTimeout(diceRollEndRef.current);
        diceRollEndRef.current = setTimeout(() => setDiceRolling(false), 950);
      },
      'game:finished': (data) => setWinner(data),
      'error': ({ message }) => {
        setAiStarting(false);
        alert(message);
      },
    };
    Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn));
    return () => {
      Object.keys(handlers).forEach(ev => socket.off(ev));
      if (diceRollEndRef.current) clearTimeout(diceRollEndRef.current);
    };
  }, [socket]);

  useEffect(() => {
    if (!gameState || winner) return;
    setMatchSeconds(MATCH_DURATION_SEC);
    const id = setInterval(() => {
      setMatchSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [gameState, winner]);

  const myPlayer = gameState?.players?.find(p => String(p.id) === String(user?.id));
  const pathColor = gameState && showPathNumbers
    ? (myPlayer?.color ?? pathColorFromUrl)
    : pathColorFromUrl;
  const pathWalk = useColorPathWalk(pathColor, 1);
  const pathLegend = getPathDebugLegend(pathColor);
  const pathPrefix = { blue: 'B', red: 'R', green: 'G', yellow: 'Y' }[pathColor] ?? '?';
  const isMyTurn = String(gameState?.players?.[gameState.currentTurn]?.id) === String(user?.id);
  const displayDice = gameState?.diceValue ?? diceValue;

  useGameSounds({ socket, gameState, winner, userId: user?.id });

  const handleRoll = () => {
    if (!isMyTurn || !gameState?.canRoll || diceRolling) return;
    playSound('uiTap', { volume: 0.5 });
    setDiceRolling(true);
    rollDice(roomCode);
  };

  const handleMove = (tokenIndex) => moveToken(roomCode, tokenIndex);

  const handleChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !roomCode) return;
    sendChat(roomCode, text);
    setChatInput('');
  };

  const requestExit = () => setShowExitModal(true);
  const cancelExit = () => setShowExitModal(false);
  const confirmExit = () => {
    setShowExitModal(false);
    navigate('/home');
  };

  if (winner) {
    const isWinner = winner.winnerId === user?.id;
    return (
      <div className="winner-screen-real winner-screen-real--with-sound">
        <div className="game-winner-sound">
          <GameSoundToggle />
        </div>
        <motion.div className="winner-confetti" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>
          {isWinner ? '🏆' : '🎲'}
        </motion.div>
        <motion.h1 className="winner-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {isWinner ? 'YOU WIN!' : 'Nice Try!'}
        </motion.h1>
        {isWinner && winner.prize > 0 && (
          <motion.p className="winner-prize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            +₹{winner.prize?.toFixed(0)} 🪙
          </motion.p>
        )}
        <motion.button className="btn btn-gold" style={{ marginTop: 32 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} onClick={() => navigate('/home')}>
          {isAiMatch ? 'Play AI Again' : 'Play Again'}
        </motion.button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className={`page-game page-game-wait ${showPathNumbers ? 'page-game-wait--path-debug' : ''}`}>
        <div className="game-hud-controls">
          <GameExitButton onClick={requestExit} />
          <GameSoundToggle />
        </div>
        <GameExitModal open={showExitModal} onCancel={cancelExit} onConfirm={confirmExit} />
        {showPathNumbers && (
          <div className="path-debug-board-wrap">
            <p className="path-debug-board-title">
              {pathColor.charAt(0).toUpperCase() + pathColor.slice(1)} path — game start ki zaroorat nahi
            </p>
            <div className="path-color-tabs" role="tablist" aria-label="Path color">
              {PATH_COLORS.map((c) => (
                <a
                  key={c}
                  href={`?pathNums=1&pathColor=${c}`}
                  className={`path-color-tab path-color-tab--${c}${c === pathColor ? ' path-color-tab--active' : ''}`}
                  role="tab"
                  aria-selected={c === pathColor}
                >
                  {c}
                </a>
              ))}
            </div>
            <div className="game-board-frame game-board-frame--path-debug">
              <RealLudoBoard
                showPathNumbers
                gameState={{ players: [] }}
                pathColor={pathColor}
                pathWalk={pathWalk}
                onPathWalkTap={pathWalk.walkTo}
              />
              <div className="path-cell-legend path-cell-legend--below-board" role="note">
                <strong>{pathColor} path</strong>
                <ul>
                  {pathLegend.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {pathWalk.canWalk ? (
                  <p className="path-cell-legend-hint">
                    {pathColor} pawn #1 par — <b>1</b> se <b>{pathPrefix}7</b> tak tap karo.
                  </p>
                ) : (
                  <p className="path-cell-legend-hint">
                    Ring abhi calibrate nahi — blue jaisa step-by-step numbers batao.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="game-wait-center">
          {!showPathNumbers && <div className="game-wait-spinner" />}
          <h2>
            {showPathNumbers
              ? `${pathColor} path — ${pathWalk.canWalk ? `tap 1 → ${pathPrefix}7` : 'calibration pending'}`
              : aiStarting || isAiMatch
                ? 'Starting game…'
                : 'Waiting for players…'}
          </h2>
          <p>{roomCode && roomCode !== 'loading' ? `Room ${roomCode}` : 'Preparing board'}</p>
          {!isAiMatch && !aiStarting && !showPathNumbers && (
            <>
              <div className="card" style={{ marginTop: 20, width: '100%', maxWidth: 320 }}>
                {players.map(p => (
                  <div key={p.user_id || p.userId} className="list-item" style={{ background: '#f5f5f5', border: 'none' }}>
                    <div className="avatar" style={{ background: COLOR_MAP[p.color], borderRadius: '50%' }}>{(p.username || '?')[0]}</div>
                    <div>
                      <p style={{ fontWeight: 800, color: '#333' }}>{p.username}</p>
                      <span className="badge badge-gold">{p.color}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-gold btn-block"
                style={{ marginTop: 16, maxWidth: 320 }}
                onClick={() => {
                  playSound('ready');
                  setReady(roomCode);
                }}
              >
                I&apos;m Ready
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-game page-game-live">
      <GameExitModal open={showExitModal} onCancel={cancelExit} onConfirm={confirmExit} />
      <header className="game-hud game-hud-minimal">
        <div className="game-hud-controls">
          <GameExitButton onClick={requestExit} />
          <GameSoundToggle />
        </div>
        <div className="game-header-brand">
          <LudoSphereLogo size="sm" animated layout="row" className="game-header-logo" />
        </div>
        <span className="game-hud-spacer" aria-hidden />
      </header>

      <div className="game-screen-center">
        <div className="game-board-stack">
          <GameMatchTimer secondsLeft={matchSeconds} urgent={matchSeconds <= 60} />

          <div className={`game-board-frame ${showPathNumbers ? 'game-board-frame--path-debug' : ''}`}>
            <GamePlayerProfiles gameState={gameState} user={user} />
            <RealLudoBoard
              gameState={gameState}
              myColor={myPlayer?.color}
              isMyTurn={isMyTurn}
              movableTokens={gameState.movableTokens}
              onTokenClick={handleMove}
              showPathNumbers={showPathNumbers}
              pathColor={pathColor}
              pathWalk={showPathNumbers ? pathWalk : null}
              onPathWalkTap={showPathNumbers ? pathWalk.walkTo : undefined}
            />
            {showPathNumbers && (
              <div className="path-cell-legend path-cell-legend--below-board" role="note">
                <strong>Game — {pathColor} path</strong>
                <p className="path-cell-legend-hint">
                  Pawn inhi numbered cells par chalega (calibrated path).
                </p>
                <ul>
                  {pathLegend.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isMyTurn && gameState.phase === 'moving' && (
            <p className="game-move-hint">Tap glowing token</p>
          )}

          <div className="game-dice-slot">
            <Dice3D
              value={displayDice}
              rolling={diceRolling}
              onRoll={handleRoll}
              canRoll={isMyTurn && gameState.canRoll && !diceRolling}
              turnStartedAt={gameState.turnStartedAt}
              turnDurationSec={gameState.turnTimerSeconds ?? 10}
              showTurnRing={isMyTurn && gameState.phase !== 'finished'}
              isMyTurn={isMyTurn}
            />
          </div>
        </div>
      </div>

      <footer className="game-footer-compact">
        <aside className="game-expression-rail" aria-label="Reactions">
          <ExpressionPanel onSend={(emoji) => sendEmoji(roomCode, emoji)} />
        </aside>

        {gameState.chat?.length > 0 && (
          <div className="game-chat">
            {gameState.chat.slice(-4).map(msg => (
              <div key={msg.id} className="game-chat-msg">
                <span className="name">{msg.username}: </span>{msg.emoji || msg.message}
              </div>
            ))}
          </div>
        )}

        <form className="game-chat-form" onSubmit={handleChat}>
          <div className="game-chat-bar">
            <span className="game-chat-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              className="game-chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message…"
              maxLength={120}
              aria-label="Chat message"
            />
            <button
              type="submit"
              className="game-chat-send"
              disabled={!chatInput.trim() || !roomCode}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 11.5 20 4 14.5 21 11.5 13.5 3 11.5Z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}

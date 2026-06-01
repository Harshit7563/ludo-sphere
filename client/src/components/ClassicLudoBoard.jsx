import { motion } from 'framer-motion';

const HOME_LAYOUT = {
  red: [0, 1, 2, 3],
  green: [0, 1, 2, 3],
  yellow: [0, 1, 2, 3],
  blue: [0, 1, 2, 3],
};

export default function ClassicLudoBoard({
  gameState,
  myColor,
  isMyTurn,
  movableTokens = [],
  onTokenClick,
}) {
  const players = gameState?.players || [];

  const renderCornerTokens = (color) => {
    const player = players.find(p => p.color === color);
    if (!player) {
      return HOME_LAYOUT[color].map(i => <div key={i} className="home-slot" />);
    }
    return player.tokens.map((pos, idx) => {
      const inBase = pos === 0;
      const movable = isMyTurn && color === myColor && movableTokens.includes(idx);
      return (
        <div key={idx} className="home-slot">
          {inBase ? (
            <motion.div
              className={`ludo-token token-${color} ${movable ? 'movable' : ''}`}
              onClick={() => movable && onTokenClick?.(idx)}
              whileHover={movable ? { scale: 1.15, y: -2 } : {}}
              whileTap={movable ? { scale: 0.9 } : {}}
            />
          ) : null}
        </div>
      );
    });
  };

  const onPath = players.filter(p => p.tokens.some(pos => pos > 0 && pos < 59));

  return (
    <div className="classic-board-wrap">
      <div className="classic-board-shadow" />
      <div className="classic-board">
        {/* Row 1 */}
        <div className="board-home board-home-red">{renderCornerTokens('red')}</div>
        <div className="board-path-v">
          <div className="path-lane lane-white" />
          <div className="path-lane lane-red" />
          <div className="path-lane lane-white star" />
          <div className="path-lane lane-red" />
          <div className="path-lane lane-white" />
          <div className="path-lane lane-red" />
          <div className="path-lane lane-white" />
        </div>
        <div className="board-home board-home-green">{renderCornerTokens('green')}</div>

        {/* Row 2 */}
        <div className="board-path-h board-path-h-top">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`path-cell-h ${i === 2 ? 'star' : ''}`} />
          ))}
        </div>
        <div className="board-center">
          <div className="center-tri tri-red" />
          <div className="center-tri tri-green" />
          <div className="center-tri tri-yellow" />
          <div className="center-tri tri-blue" />
          <div className="center-crown-wrap">
            <span className="center-crown" aria-hidden>👑</span>
          </div>
        </div>
        <div className="board-path-h board-path-h-bottom">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`path-cell-h ${i === 3 ? 'star' : ''}`} />
          ))}
        </div>

        {/* Row 3 */}
        <div className="board-home board-home-yellow">{renderCornerTokens('yellow')}</div>
        <div className="board-path-v board-path-v-bottom">
          <div className="path-lane lane-white" />
          <div className="path-lane lane-blue" />
          <div className="path-lane lane-white star" />
          <div className="path-lane lane-blue" />
          <div className="path-lane lane-white" />
          <div className="path-lane lane-blue" />
          <div className="path-lane lane-white" />
        </div>
        <div className="board-home board-home-blue">{renderCornerTokens('blue')}</div>

        {/* Active path tokens (simplified strip) */}
        {onPath.length > 0 && (
          <div className="board-active-tokens">
            {onPath.map(p => (
              <span key={p.color} className={`active-chip chip-${p.color}`}>
                {p.tokens.filter(t => t > 0 && t < 59).length} on board
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { YARD_SLOTS } from '../game/yardLayout';
import { PAWN_IMAGES } from '../game/gameAssets';
import PathCellNumbers from './PathCellNumbers';
import BoardPawn from './BoardPawn';

export default function RealLudoBoard({
  gameState,
  myColor,
  isMyTurn,
  movableTokens = [],
  onTokenClick,
  showPathNumbers = false,
  pathWalk = null,
  onPathWalkTap,
  pathColor = 'blue',
}) {
  const players = gameState?.players || [];
  const pathWalkInteractive = showPathNumbers && pathWalk != null;
  const [yardLayerEl, setYardLayerEl] = useState(null);

  const pawnSpecs = useMemo(() => {
    const list = [];
    for (const player of players) {
      player.tokens.forEach((serverPosition, tokenIndex) => {
        list.push({
          key: `${player.color}-${tokenIndex}`,
          color: player.color,
          tokenIndex,
          serverPosition,
          yardSlot: YARD_SLOTS[player.color]?.[tokenIndex] ?? null,
        });
      });
    }
    return list;
  }, [players]);

  const stacked = useMemo(() => {
    const buckets = new Map();
    for (const p of pawnSpecs) {
      const key = `yard-${p.color}-${p.tokenIndex}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(p);
    }
    return buckets;
  }, [pawnSpecs]);

  const getStackMeta = (color, tokenIndex) => {
    const group = stacked.get(`yard-${color}-${tokenIndex}`) || [];
    const index = group.findIndex((p) => p.tokenIndex === tokenIndex);
    return { index: Math.max(0, index), total: group.length || 1 };
  };

  const pathWalkCell = pathWalk?.cell;

  return (
    <div className={`real-ludo-board ${showPathNumbers ? 'real-ludo-board--path-debug' : ''}`}>
      <div
        className={`real-ludo-board-overlay${pathWalkInteractive ? ' real-ludo-board-overlay--interactive' : ''}`}
      >
        {showPathNumbers && (
          <PathCellNumbers
            compactLegend
            pathColor={pathColor}
            interactive={pathWalkInteractive && pathWalk?.canWalk}
            activeWalkStep={pathWalk?.step ?? null}
            onWalkTap={onPathWalkTap}
            walkAnimating={pathWalk?.animating ?? false}
          />
        )}
        {pathWalkCell && pathWalk?.canWalk && (
          <div
            className="path-cell-slot path-cell-slot--pawn path-cell-slot--walk"
            style={{
              gridRow: pathWalkCell.row + 1,
              gridColumn: pathWalkCell.col + 1,
            }}
          >
            <motion.div
              key={`walk-${pathWalk.step}`}
              className={`ludo-pawn-marker path-walk-pawn on-path pawn-hop path-walk-pawn--${pathWalk.color ?? pathColor}`}
              initial={{ scale: 0.72, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 13, mass: 0.5 }}
              aria-label={`${pathWalk.color ?? pathColor} path step ${pathWalk.step}`}
            >
              <img
                src={PAWN_IMAGES[pathWalk.color ?? pathColor]}
                alt=""
                className={`ludo-pawn ludo-pawn--${pathWalk.color ?? pathColor}`}
                draggable={false}
              />
            </motion.div>
          </div>
        )}
        {pawnSpecs.map((p) => {
          const { index, total } = getStackMeta(p.color, p.tokenIndex);
          const stackShift =
            total > 1
              ? {
                  dx: index * 4 - (total - 1) * 2,
                  dy: index * 2 - (total - 1),
                }
              : { dx: 0, dy: 0 };
          const movable =
            isMyTurn && p.color === myColor && movableTokens.includes(p.tokenIndex);

          return (
            <BoardPawn
              key={p.key}
              color={p.color}
              tokenIndex={p.tokenIndex}
              serverPosition={p.serverPosition}
              yardSlot={p.yardSlot}
              yardLayerEl={yardLayerEl}
              movable={movable}
              onTokenClick={onTokenClick}
              stackShift={stackShift}
              stackZ={index + 2}
            />
          );
        })}
      </div>
      <div ref={setYardLayerEl} className="real-ludo-tokens-layer" />
    </div>
  );
}

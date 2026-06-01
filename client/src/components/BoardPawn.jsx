import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { usePawnHop } from '../hooks/usePawnHop';
import { yardPercent } from '../game/yardLayout';
import { PAWN_IMAGES } from '../game/gameAssets';

const hopSpring = {
  type: 'spring',
  stiffness: 95,
  damping: 34,
  mass: 1.35,
  restDelta: 0.002,
};

const hopEnter = { scale: 0.9, y: 4, opacity: 0.92 };
const hopLand = { scale: 1, y: 0, opacity: 1 };

export default function BoardPawn({
  color,
  tokenIndex,
  serverPosition,
  yardSlot,
  yardLayerEl,
  movable = false,
  onTokenClick,
  stackShift = { dx: 0, dy: 0 },
  stackZ = 1,
}) {
  const { inYard, grid, hopKey, isHopping } = usePawnHop(color, serverPosition);
  const canClick = movable && !isHopping;

  const pawnImg = (
    <img
      src={PAWN_IMAGES[color]}
      alt=""
      className={`ludo-pawn ludo-pawn--${color}`}
      draggable={false}
    />
  );

  const yardPos = yardSlot ? yardPercent(yardSlot) : null;

  const yardNode =
    inYard && yardPos ? (
      <motion.button
        type="button"
        key={`yard-${color}-${tokenIndex}`}
        className={`ludo-pawn-marker in-yard ${canClick ? 'movable' : ''}`}
        style={{
          left: yardPos.left,
          top: yardPos.top,
          zIndex: stackZ,
          '--pawn-dx': `${stackShift.dx}px`,
          '--pawn-dy': `${stackShift.dy}px`,
          '--pawn-anchor': `${yardPos.anchorY ?? 82}%`,
          '--pawn-scale': yardPos.scale ?? 1,
        }}
        onClick={() => canClick && onTokenClick?.(tokenIndex)}
        whileTap={canClick ? { scale: 0.88 } : {}}
        aria-label={`Token ${tokenIndex + 1}`}
      >
        {pawnImg}
      </motion.button>
    ) : null;

  const pathNode =
    !inYard && grid ? (
      <div
        className="path-cell-slot path-cell-slot--pawn"
        style={{ gridRow: grid[0] + 1, gridColumn: grid[1] + 1 }}
      >
        <motion.button
          type="button"
          key={`hop-${color}-${tokenIndex}-${hopKey}`}
          className={`ludo-pawn-marker on-path pawn-hop ${canClick ? 'movable' : ''} ${isHopping ? 'pawn-hop--active' : ''}`}
          style={{
            zIndex: stackZ + (isHopping ? 3 : 0),
            '--pawn-dx': `${stackShift.dx}px`,
            '--pawn-dy': `${stackShift.dy}px`,
            '--pawn-scale': 1,
          }}
          initial={hopEnter}
          animate={hopLand}
          transition={hopSpring}
          onClick={() => canClick && onTokenClick?.(tokenIndex)}
          whileTap={canClick ? { scale: 0.88 } : {}}
          aria-label={`Token ${tokenIndex + 1}`}
        >
          {pawnImg}
        </motion.button>
      </div>
    ) : null;

  return (
    <>
      {pathNode}
      {yardNode && yardLayerEl ? createPortal(yardNode, yardLayerEl) : null}
    </>
  );
}

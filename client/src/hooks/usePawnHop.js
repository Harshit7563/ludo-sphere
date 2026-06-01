import { useEffect, useRef, useState } from 'react';
import { gridForToken } from '../game/pathCoords';
import { getHopCellsBetween, PAWN_HOP_MS } from '../game/pawnPathCells';
import { sleep } from '../game/colorPathWalk';
import { playSound } from '../audio/soundEngine';

export function usePawnHop(color, serverPosition) {
  const prevPosRef = useRef(serverPosition);
  const runIdRef = useRef(0);
  const [inYard, setInYard] = useState(serverPosition === 0);
  const [grid, setGrid] = useState(() =>
    serverPosition === 0 ? null : gridForToken(color, serverPosition)
  );
  const [hopKey, setHopKey] = useState(0);
  const [isHopping, setIsHopping] = useState(false);

  useEffect(() => {
    const from = prevPosRef.current;
    const to = serverPosition;

    if (from === to) {
      if (to === 0) {
        setInYard(true);
        setGrid(null);
      } else {
        setInYard(false);
        setGrid(gridForToken(color, to));
      }
      return undefined;
    }

    const runId = ++runIdRef.current;

    (async () => {
      setIsHopping(true);

      if (to === 0) {
        setInYard(true);
        setGrid(null);
        setHopKey((k) => k + 1);
        prevPosRef.current = to;
        setIsHopping(false);
        return;
      }

      const cells = getHopCellsBetween(color, from, to);

      if (from === 0) {
        setInYard(false);
      }

      if (cells.length === 0) {
        const end = gridForToken(color, to);
        if (end) {
          setGrid(end);
          setHopKey((k) => k + 1);
        }
      } else {
        for (let i = 0; i < cells.length; i++) {
          if (runIdRef.current !== runId) return;
          const cell = cells[i];
          setGrid(cell);
          setHopKey((k) => k + 1);
          playSound('tokenHop', { pitch: 0.92 + (i % 4) * 0.04, volume: 0.85 });
          await sleep(PAWN_HOP_MS);
        }
      }

      if (runIdRef.current !== runId) return;

      const final = gridForToken(color, to);
      if (final) setGrid(final);
      setInYard(false);
      prevPosRef.current = to;
      setIsHopping(false);
    })();

    return () => {
      runIdRef.current += 1;
    };
  }, [color, serverPosition]);

  return { inYard, grid, hopKey, isHopping };
}

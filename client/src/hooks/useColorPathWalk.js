import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getColorWalkCell,
  getColorWalkMaxStep,
  sleep,
} from '../game/colorPathWalk.js';
import { getColorPath } from '../game/colorPaths.js';

const STEP_MS = 130;

export function useColorPathWalk(color = 'blue', initialStep = 1) {
  const path = getColorPath(color);
  const canWalk = Boolean(path?.calibrated);

  const [step, setStep] = useState(canWalk ? initialStep : 0);
  const [animating, setAnimating] = useState(false);
  const stepRef = useRef(canWalk ? initialStep : 0);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (canWalk) {
      stepRef.current = initialStep;
      setStep(initialStep);
    } else {
      stepRef.current = 0;
      setStep(0);
    }
  }, [color, canWalk, initialStep]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const walkTo = useCallback(async (targetStep) => {
    const maxStep = getColorWalkMaxStep(color);
    if (
      !canWalk
      || animatingRef.current
      || targetStep < 1
      || targetStep > maxStep
      || targetStep === stepRef.current
    ) {
      return;
    }

    animatingRef.current = true;
    setAnimating(true);

    const dir = targetStep > stepRef.current ? 1 : -1;
    for (let s = stepRef.current + dir; ; s += dir) {
      stepRef.current = s;
      setStep(s);
      if (s === targetStep) break;
      await sleep(STEP_MS);
    }

    animatingRef.current = false;
    setAnimating(false);
  }, [color, canWalk]);

  const resetWalk = useCallback(() => {
    animatingRef.current = false;
    setAnimating(false);
    const start = canWalk ? initialStep : 0;
    stepRef.current = start;
    setStep(start);
  }, [canWalk, initialStep]);

  return {
    color,
    step,
    animating,
    canWalk,
    walkTo,
    resetWalk,
    cell: canWalk ? getColorWalkCell(color, step) : null,
  };
}

/** @deprecated use useColorPathWalk('blue') */
export function useBluePathWalk(initialStep = 1) {
  return useColorPathWalk('blue', initialStep);
}

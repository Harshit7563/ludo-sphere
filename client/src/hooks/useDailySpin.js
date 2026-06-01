import { useState, useRef } from 'react';
import { api } from '../utils/api';
import { calcSpinRotation, prizeToSegmentIndex } from '../components/spinWheelUtils';

const SPIN_MS = 4500;

export function useDailySpin(onSuccess) {
  const [rotation, setRotation] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const runId = useRef(0);

  const spin = async () => {
    if (spinning) return;
    const id = ++runId.current;
    setSpinning(true);
    setResult(null);
    setError('');
    setAnimating(false);
    setRotation(0);

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (id !== runId.current) return;

    try {
      const res = await api('/rewards/daily', { method: 'POST' });
      if (id !== runId.current) return;

      const seg = prizeToSegmentIndex(res.amount);
      setAnimating(true);
      setRotation(calcSpinRotation(seg));

      setTimeout(() => {
        if (id !== runId.current) return;
        setAnimating(false);
        setSpinning(false);
        setResult(res);
        onSuccess?.(res);
      }, SPIN_MS);
    } catch (e) {
      if (id !== runId.current) return;
      setSpinning(false);
      setError(e.message || 'Spin failed');
    }
  };

  const reset = () => {
    runId.current += 1;
    setSpinning(false);
    setAnimating(false);
    setRotation(0);
    setResult(null);
    setError('');
  };

  return { rotation, animating, spinning, result, error, spin, reset };
}

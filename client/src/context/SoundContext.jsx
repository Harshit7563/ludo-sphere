import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { playSound, soundEngine } from '../audio/soundEngine';

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => soundEngine.isEnabled());

  useEffect(() => {
    const unlock = () => soundEngine.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const toggleSound = useCallback(() => {
    const next = soundEngine.toggle();
    setEnabled(next);
    return next;
  }, []);

  const setSoundEnabled = useCallback((on) => {
    soundEngine.setEnabled(on);
    setEnabled(!!on);
  }, []);

  const play = useCallback((id, opts) => {
    playSound(id, opts);
  }, []);

  const value = useMemo(
    () => ({ enabled, toggleSound, setSoundEnabled, play }),
    [enabled, toggleSound, setSoundEnabled, play],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
}

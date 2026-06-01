import { useState, useRef, useEffect } from 'react';
import ExpressionIcon, { EXPRESSIONS } from './ExpressionIcons';

export default function ExpressionPanel({ onSend }) {
  const [open, setOpen] = useState(false);
  const [iconIndex, setIconIndex] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (open) return;
    const id = setInterval(() => {
      setIconIndex(i => (i + 1) % EXPRESSIONS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const pick = (item) => {
    onSend(item.emoji);
    setOpen(false);
  };

  return (
    <div className="expression-panel expression-panel--right" ref={ref}>
      <button
        type="button"
        className={`expression-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Send reaction"
        title="Reactions"
      >
        <span
          key={EXPRESSIONS[iconIndex].id}
          className="expression-trigger-icon-wrap"
          aria-hidden
        >
          <ExpressionIcon name={EXPRESSIONS[iconIndex].id} size={30} />
        </span>
      </button>

      {open && (
        <div className="expression-menu" role="menu" aria-label="Reactions">
          <div className="expression-menu-grid">
            {EXPRESSIONS.map(item => (
              <button
                key={item.id}
                type="button"
                className="expression-menu-item"
                role="menuitem"
                onClick={() => pick(item)}
                aria-label={item.label}
                title={item.label}
              >
                <ExpressionIcon name={item.id} size={32} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

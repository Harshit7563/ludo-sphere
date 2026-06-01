import { useNavigate } from 'react-router-dom';
import RushHeader from './RushHeader';

export default function SubPageShell({ title, children, className = '', onBack }) {
  const navigate = useNavigate();

  return (
    <div className={`page page-rush page-sub ${className}`.trim()}>
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>

      <RushHeader />

      <div className="sub-topbar">
        <button type="button" className="sub-back" onClick={onBack || (() => navigate(-1))} aria-label="Go back">
          ←
        </button>
        <h1>{title}</h1>
      </div>

      {children}
    </div>
  );
}

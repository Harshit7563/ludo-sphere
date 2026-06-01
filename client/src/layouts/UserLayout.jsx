import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const FOOTER_HIDDEN_PREFIXES = ['/game/'];

export default function UserLayout() {
  const { pathname } = useLocation();
  const hideFooter = FOOTER_HIDDEN_PREFIXES.some(p => pathname.startsWith(p));

  return (
    <div className={`app-shell ${hideFooter ? 'app-shell-no-footer' : ''}`}>
      <main className="app-main">
        <Outlet />
      </main>
      {!hideFooter && <BottomNav />}
    </div>
  );
}

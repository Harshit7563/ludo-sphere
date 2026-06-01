import { useState, useEffect } from 'react';
import RushHeader from '../components/RushHeader';
import RushDailyStrip from '../components/RushDailyStrip';
import RushWinTicker from '../components/RushWinTicker';
import RushLobbies from '../components/RushLobbies';
import { api } from '../utils/api';
import {
  getScrollingBannerEnabled,
  SCROLLING_BANNER_EVENT,
} from '../utils/scrollingBanner';

export default function Home() {
  const [showScrollingBanner, setShowScrollingBanner] = useState(() => getScrollingBannerEnabled());
  const [adminAllowsBanner, setAdminAllowsBanner] = useState(true);

  useEffect(() => {
    api('/app-config')
      .then((cfg) => setAdminAllowsBanner(cfg.scrollingBanner !== false))
      .catch(() => setAdminAllowsBanner(true));

    const syncUserPref = () => setShowScrollingBanner(getScrollingBannerEnabled());

    const onBannerChange = () => syncUserPref();
    window.addEventListener(SCROLLING_BANNER_EVENT, onBannerChange);
    window.addEventListener('storage', onBannerChange);

    return () => {
      window.removeEventListener(SCROLLING_BANNER_EVENT, onBannerChange);
      window.removeEventListener('storage', onBannerChange);
    };
  }, []);

  const bannerVisible = adminAllowsBanner && showScrollingBanner;

  return (
    <div className="page page-rush">
      <div className="rush-bg-effects">
        <span className="rush-orb rush-orb-1" />
        <span className="rush-orb rush-orb-2" />
      </div>
      <RushHeader />
      <RushDailyStrip />
      {bannerVisible && <RushWinTicker />}
      <RushLobbies />
    </div>
  );
}

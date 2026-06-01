const STORAGE_KEY = 'ludo_scrolling_banner';
export const SCROLLING_BANNER_EVENT = 'ludo-scrolling-banner-change';

export function getScrollingBannerEnabled() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return true;
    return v === '1' || v === 'true';
  } catch {
    return true;
  }
}

export function setScrollingBannerEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    window.dispatchEvent(
      new CustomEvent(SCROLLING_BANNER_EVENT, { detail: { enabled } })
    );
  } catch {
    /* ignore */
  }
}

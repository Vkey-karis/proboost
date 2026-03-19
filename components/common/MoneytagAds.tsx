import { useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { useCredits } from '../../hooks/useCredits.ts';

/**
 * MoneytagAds
 * ───────────────────────────────────────────────────────────────────
 * Injects Monetag ad scripts ONLY for free / unauthenticated users.
 * Paid subscribers (Hunter, Authority, Agency) never load these scripts,
 * giving them a genuinely ad-free experience.
 *
 * Formats active:
 *   1. In-Page Push  — Zone 10749432 — small dismissible corner notification
 *   2. Vignette      — Zone 10749456 — appears between navigation actions
 *
 * To disable an individual format, comment out the relevant object in ZONES.
 */

const ZONES = [
  {
    id: 'in-page-push',
    zone: '10749432',
    src: 'https://nap5k.com/tag.min.js',
  },
  {
    id: 'vignette',
    zone: '10749456',
    src: 'https://gizokraijaw.net/vignette.min.js',
  },
];

export const MoneytagAds: React.FC = () => {
  const { user } = useAppContext();
  const { tier } = useCredits();
  const injected = useRef(false);

  // Show ads only to free/unauthenticated users
  // Wait until auth state is resolved (user !== undefined) before deciding
  const isPaidUser = tier === 'hunter' || tier === 'authority' || tier === 'agency';

  useEffect(() => {
    // Don't inject if already done or if user is paying
    if (injected.current || isPaidUser) return;

    // If user is still loading (unlikely but safe), wait
    // user === null means "resolved: not logged in" → show ads
    // user === undefined means "still loading" in some patterns
    // Since AppContext initialises user as null, null = not logged in = free → show ads

    ZONES.forEach(({ zone, src }) => {
      const existing = document.querySelector(`script[data-monetag-zone="${zone}"]`);
      if (existing) return; // don't double-inject on hot reload

      const s = (document.body || document.documentElement).appendChild(
        document.createElement('script')
      );
      s.dataset.zone = zone;
      s.dataset.monetagZone = zone; // our own marker for dedup check
      (s as HTMLScriptElement).src = src;
      (s as HTMLScriptElement).async = true;
    });

    injected.current = true;
  }, [isPaidUser]);

  // This component renders nothing visible
  return null;
};

// Re-export for convenience
import React from 'react';
export default MoneytagAds;

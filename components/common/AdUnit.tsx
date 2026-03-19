import React, { useEffect, useRef } from 'react';
import { useCredits } from '../../hooks/useCredits.ts';

// ─────────────────────────────────────────────────────────────────────────────
// MONETAG BANNER ZONE CONFIGURATION
//
// This component handles BANNER zones only.
// The In-Page Push zone is already live in index.html.
//
// HOW TO ADD YOUR VIGNETTE / INTERSTITIAL BANNER ZONES:
//   1. In Monetag dashboard → Ad Units → Create Zone → "Vignette Banner" or "Interstitial"
//   2. Copy the embed code — it looks like:
//        (function(s){ s.dataset.zone='XXXXXXX', s.src='https://nap5k.com/tag.min.js' })(...)
//   3. Paste the numeric Zone ID into BANNER_ZONES below
//   4. The CDN is already set to 'nap5k.com' (from your In-Page Push code)
// ─────────────────────────────────────────────────────────────────────────────

const MONETAG_CDN = 'nap5k.com';  // ✅ confirmed from your embed code

const BANNER_ZONES: Record<string, string> = {
  'dashboard-sidebar':  '',   // 👈 paste Vignette/Interstitial Zone ID here
  'job-search-sidebar': '',   // 👈 paste Vignette/Interstitial Zone ID here
  'default':            '',
};

// ─────────────────────────────────────────────────────────────────────────────

interface AdUnitProps {
  placement?: keyof typeof BANNER_ZONES;
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  placement = 'default',
  className = '',
}) => {
  const { tier } = useCredits();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjected = useRef(false);

  // ── Gate: never show banner ads to paid subscribers ────────────────────────
  const isPaidUser = tier && tier !== 'free';

  const zoneId = BANNER_ZONES[placement] ?? BANNER_ZONES['default'];
  const isConfigured = zoneId !== '';

  // ── Inject Monetag zone script using their exact pattern ───────────────────
  useEffect(() => {
    if (!isConfigured || scriptInjected.current || !containerRef.current || isPaidUser) return;

    // Matches Monetag's exact injection pattern:
    // (function(s){ s.dataset.zone='ZONE', s.src='https://CDN/tag.min.js' })(container.appendChild(script))
    const script = document.createElement('script');
    script.dataset.zone = zoneId;
    script.src = `https://${MONETAG_CDN}/tag.min.js`;
    containerRef.current.appendChild(script);
    scriptInjected.current = true;

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
      scriptInjected.current = false;
    };
  }, [isConfigured, zoneId, isPaidUser]);

  // ── Nothing rendered for paid users ───────────────────────────────────────
  if (isPaidUser) return null;

  // ── Placeholder until banner Zone IDs are added ───────────────────────────
  if (!isConfigured) {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 opacity-40 select-none ${className}`}
        aria-hidden="true"
        data-placement={placement}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span className="text-sm font-black text-slate-400">M</span>
        </div>
        <div className="min-w-0 flex-grow">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sponsored</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">Add Vignette Zone ID to activate banner</p>
        </div>
        <span className="flex-shrink-0 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Monetag</span>
      </div>
    );
  }

  // ── Live Monetag banner container ─────────────────────────────────────────
  return (
    <div className={`monetag-wrapper overflow-hidden ${className}`} aria-label="Advertisement">
      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-300 dark:text-slate-600 mb-1 text-center">
        Sponsored
      </p>
      <div ref={containerRef} className="monetag-zone" data-zone={zoneId} />
    </div>
  );
};

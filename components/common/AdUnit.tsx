import React, { useEffect, useRef } from 'react';
import { useCredits } from '../../hooks/useCredits.ts';

// ─────────────────────────────────────────────────────────────────────────────
// MONETAG CONFIGURATION
//
// HOW TO GET YOUR ZONE IDs:
//   1. Log into monetag.com → Sites → Add Site → enter proboost.aimoneygigs.com
//   2. Go to "Ad Units" → Create New Zone for each format below
//   3. Copy the numeric Zone ID and paste it here
//
// ZONE TYPES TO CREATE  (see guide at bottom of this file):
//   BANNER_ZONES         → "Interstitial" or "In-Page Push" zones
//   IN_PAGE_PUSH_ZONE_ID → Special: injected via <head>, auto-renders in corner
//
// Leave any zone as '' to skip that placement (shows tasteful placeholder).
// ─────────────────────────────────────────────────────────────────────────────

// Banner/Display zone IDs — one per placement location in the app
const BANNER_ZONES: Record<string, string> = {
  'dashboard-sidebar':  '',  // 👈 paste Zone ID, e.g. '1234567'
  'job-search-sidebar': '',  // 👈 paste Zone ID, e.g. '7654321'
  'default':            '',
};

// The Monetag CDN domain they give you (shown in your dashboard embed code)
// It looks like: 'gizmochipu.com' or 'uptownalertz.com' — copy it exactly
const MONETAG_CDN = '';  // 👈 e.g. 'gizmochipu.com'

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

  // ── Gate: never show ads to paid subscribers ───────────────────────────────
  const isPaidUser = tier && tier !== 'free';

  const zoneId = BANNER_ZONES[placement] ?? BANNER_ZONES['default'];
  const isConfigured = MONETAG_CDN !== '' && zoneId !== '';

  // ── Inject Monetag zone script into the container div ──────────────────────
  useEffect(() => {
    if (!isConfigured || scriptInjected.current || !containerRef.current || isPaidUser) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = `https://${MONETAG_CDN}/401/${zoneId}`;

    containerRef.current.appendChild(script);
    scriptInjected.current = true;

    return () => {
      // Clean up on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptInjected.current = false;
    };
  }, [isConfigured, zoneId, isPaidUser]);

  // ── Don't render anything for paid users ───────────────────────────────────
  if (isPaidUser) return null;

  // ── Placeholder shown until Zone IDs are configured ────────────────────────
  if (!isConfigured) {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 opacity-40 select-none ${className}`}
        aria-hidden="true"
        data-placement={placement}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          {/* Monetag "M" icon */}
          <span className="text-sm font-black text-slate-400">M</span>
        </div>
        <div className="min-w-0 flex-grow">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sponsored</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">Monetag — Add your Zone ID to activate</p>
        </div>
        <span className="flex-shrink-0 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Monetag</span>
      </div>
    );
  }

  // ── Live Monetag banner container ──────────────────────────────────────────
  return (
    <div className={`monetag-wrapper overflow-hidden ${className}`} aria-label="Advertisement">
      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-300 dark:text-slate-600 mb-1 text-center">
        Sponsored
      </p>
      <div ref={containerRef} className="monetag-zone" data-zone={zoneId} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MONETAG FORMAT GUIDE — Which zones to create in the dashboard
//
// ✅  IN-PAGE PUSH (RECOMMENDED — Most Non-Intrusive)
//     • Looks like a small OS notification in the bottom-right corner of browser
//     • User can dismiss it easily — doesn't block content at all
//     • CPM: ~$0.3–1  |  Format code in Monetag: "In-Page Push"
//     • NOTE: This format is injected via <head> script, NOT via this component.
//             See index.html for the In-Page Push script placeholder.
//
// ✅  BANNER / DISPLAY (ACCEPTABLE)
//     • Standard rectangular banner, rendered inside a contained div
//     • Goes in the sidebar — doesn't interrupt the main workflow
//     • CPM: ~$0.2–0.8  |  Format code in Monetag: "Interstitial" or "Display"
//     • This is what the <AdUnit> component above renders.
//
// ⚠️  VIGNETTE (USE SPARINGLY)
//     • Shows as a small overlay between navigation actions
//     • Only fires once per session if configured correctly
//     • Can work on landing → tool transitions, but test carefully
//     • CPM: ~$1–2  |  Format code in Monetag: "Vignette"
//
// ❌  POPUNDER — DO NOT USE
//     • Opens a new browser tab/window in the background
//     • Instant brand damage for a professional career tool
//
// ❌  PUSH NOTIFICATIONS (Browser-level) — DO NOT USE
//     • Requires user to grant browser permission
//     • Sends ads even after the user has left your site
//     • Feels like spyware — will destroy user trust
// ─────────────────────────────────────────────────────────────────────────────

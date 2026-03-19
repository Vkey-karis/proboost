import React, { useEffect, useRef } from 'react';
import { useCredits } from '../../hooks/useCredits.ts';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — fill these in once AdSense approves your site.
//
//   ADSENSE_CLIENT  →  Your Publisher ID, e.g. "ca-pub-1234567890123456"
//   SLOTS           →  Ad slot IDs per placement (create these in AdSense dashboard
//                       under Ads → By ad unit → Create ad unit)
//
// Leave ADSENSE_CLIENT as an empty string; the component renders a tasteful
// placeholder instead of breaking the layout while you wait for approval.
// ─────────────────────────────────────────────────────────────────────────────
const ADSENSE_CLIENT = '';  // 👈  e.g.  'ca-pub-1234567890123456'

const SLOTS: Record<string, string> = {
    'dashboard-sidebar': '',  // 👈  e.g.  '1234567890'
    'job-search-sidebar': '',  // 👈  e.g.  '0987654321'
    'default': '',
};

// Extend Window interface for adsbygoogle
declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

// ─────────────────────────────────────────────────────────────────────────────

interface AdUnitProps {
    /** Must match a key in the SLOTS map above */
    placement?: keyof typeof SLOTS;
    /** ad format: 'auto' (responsive) | 'rectangle' | 'horizontal' */
    format?: 'auto' | 'rectangle' | 'horizontal';
    /** Extra Tailwind classes on the outer wrapper */
    className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
    placement = 'default',
    format = 'auto',
    className = '',
}) => {
    const { tier } = useCredits();
    const insRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);

    // ── Gate: hide completely for paid subscribers ─────────────────────────────
    const isPaidUser = tier && tier !== 'free';
    if (isPaidUser) return null;

    const isConfigured = ADSENSE_CLIENT !== '' && (SLOTS[placement] ?? SLOTS['default']) !== '';
    const adSlot = SLOTS[placement] ?? SLOTS['default'];

    // ── Push to adsbygoogle once the <ins> element is in the DOM ──────────────
    useEffect(() => {
        if (!isConfigured || pushed.current || !insRef.current) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch (e) {
            console.warn('[AdUnit] adsbygoogle push failed:', e);
        }
    }, [isConfigured]);

    // ── Pending placeholder ────────────────────────────────────────────────────
    if (!isConfigured) {
        return (
            <div
                className={`
          flex items-center gap-3 p-4 rounded-2xl
          border border-dashed border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-slate-800/30
          opacity-50 select-none
          ${className}
        `}
                aria-hidden="true"
                data-placement={placement}
            >
                {/* Google-ish icon */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </div>
                <div className="min-w-0 flex-grow">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sponsored</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">Google AdSense — Pending Approval</p>
                </div>
                <span className="flex-shrink-0 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Ads by Google</span>
            </div>
        );
    }

    // ── Live AdSense Unit ──────────────────────────────────────────────────────
    return (
        <div className={`adsense-wrapper overflow-hidden ${className}`} aria-label="Advertisement">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-1 text-center">
                Sponsored
            </p>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={adSlot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
};


import React, { useState } from 'react';
import { FeatureName } from '../types.ts';
import { Button } from './common/Button.tsx';
import { Spinner } from './common/Spinner.tsx';

const FeatureItem: React.FC<{ label: string; included: boolean; highlight?: boolean; premium?: boolean }> = ({ label, included, highlight, premium }) => (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${included ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
            {included ? (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M6 18L18 6M6 6l12 12" /></svg>
            )}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-tight ${included ? (highlight ? 'text-white' : 'text-slate-700 dark:text-slate-300') : 'text-slate-400 line-through opacity-50'}`}>
            {label}
            {premium && included && <span className="ml-2 text-[7px] bg-primary-500 text-white px-1 rounded-sm">PRO</span>}
        </span>
    </div>
);

const PricingTier: React.FC<{
    title: string;
    price: string;
    period?: string;
    description: string;
    apps: { name: string; included: boolean; premium?: boolean }[];
    highlight?: boolean;
    cta: string;
    tokenCap: string;
    onCta: () => void;
}> = ({ title, price, period = "/mo", description, apps, highlight, cta, tokenCap, onCta }) => (
    <div className={`relative p-8 rounded-[2.5rem] flex flex-col h-full transition-all duration-500 hover:-translate-y-1 ${highlight ? 'bg-slate-900 text-white shadow-3xl scale-105 z-10 border-t-4 border-primary-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl'}`}>
        <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
                <h3 className={`text-xl font-black uppercase tracking-tighter ${highlight ? 'text-primary-400' : 'text-slate-900 dark:text-white'}`}>{title}</h3>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${highlight ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-100 text-slate-500'}`}>{tokenCap}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{price}</span>
                {price !== 'Free' && <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{period}</span>}
            </div>
            <p className={`mt-4 text-xs font-medium leading-relaxed ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </div>

        <div className="space-y-0.5 mb-8 flex-grow">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${highlight ? 'text-white/30' : 'text-slate-400'}`}>What you get</p>
            {apps.map((app, i) => (
                <FeatureItem key={i} label={app.name} included={app.included} highlight={highlight} premium={app.premium} />
            ))}
        </div>

        <button
            onClick={onCta}
            className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-lg ${highlight ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-900 dark:text-white'}`}
        >
            {cta}
        </button>
    </div>
);

import { BackButton } from './common/BackButton.tsx';

// ... (imports remain)

interface ResourcesProps {
    onSelectFeature: (feature: FeatureName) => void;
    onBack: () => void;
}

import { PaymentModal } from './PaymentModal.tsx';

// ... (imports remain)

export const Resources: React.FC<ResourcesProps> = ({ onSelectFeature, onBack }) => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [planPrice, setPlanPrice] = useState<string>('');

    const handlePlanSelect = (plan: string, price: string) => {
        setSelectedPlan(plan);
        setPlanPrice(price);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
            <BackButton onClick={onBack} />
            <header className="text-center mb-24 animate-fade-in">
                <div className="inline-block px-6 py-2 mb-8 text-[10px] font-black uppercase tracking-[0.4em] bg-primary-600 text-white rounded-full shadow-2xl">
                    Pick a Plan
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight uppercase">
                    Simple <span className="text-primary-600 italic">Pricing</span>
                </h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium">
                    Start for free, or get extra help to build your career. We have a plan for everyone.
                </p>
            </header>

            {/* Payment Modal */}
            {selectedPlan && (
                <PaymentModal
                    plan={selectedPlan}
                    price={planPrice}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => {
                        // Here you would likely update the user's subscription status in Supabase
                        console.log('Payment success for', selectedPlan);
                    }}
                />
            )}

            {/* Pricing Section */}
            <section className="mb-48" id="pricing">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto items-stretch">
                    <PricingTier
                        title="Free Trial" price="Free" period="24 Hours" tokenCap="Trial" description="Try everything for a whole day."
                        apps={[{ name: "All 11 Apps", included: true }, { name: "Fast AI Help", included: true }, { name: "Find Jobs", included: true }]}
                        cta="Try it for free" onCta={() => onSelectFeature(FeatureName.JobSearch)}
                    />
                    <PricingTier
                        title="Hunter" price="$29" tokenCap="Standard" description="Best for finding a new job fast."
                        apps={[{ name: "Job Search AI", included: true }, { name: "Resume Fixer", included: true }, { name: "Interview Help", included: true }]}
                        cta="Go Hunter" onCta={() => handlePlanSelect('Hunter', '$29')}
                    />
                    <PricingTier
                        title="Authority" price="$59" highlight tokenCap="Extra" description="Build a huge brand on LinkedIn."
                        apps={[{ name: "Everything in Hunter", included: true }, { name: "Profile Optimizer", included: true, premium: true }, { name: "News-to-Viral AI", included: true, premium: true }]}
                        cta="Get full access" onCta={() => handlePlanSelect('Authority', '$59')}
                    />
                    <PricingTier
                        title="Agency" price="$169" tokenCap="Unlimited" description="For career coaches."
                        apps={[{ name: "All 11 Apps", included: true }, { name: "A Lot of Tokens", included: true, premium: true }, { name: "Use Your Own Key", included: true, premium: true }]}
                        cta="Contact Us" onCta={() => window.location.href = 'mailto:Samuel@aimoneygigs.com'}
                    />
                </div>
            </section>

            {/* NEW NAVIGATION SECTIONS */}
            <div className="space-y-32">
                <article id="how-it-works" className="grid grid-cols-1 lg:grid-cols-12 gap-12 group pt-20 border-t border-slate-100 dark:border-slate-800">
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-primary-600 font-black text-4xl">01</span>
                                <div className="h-0.5 flex-grow bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">How it <br />works</h2>
                            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">The Simple Way</p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-2xl text-slate-600 dark:text-slate-300 font-serif italic mb-10 leading-relaxed">
                            Most people spend 15 hours a week looking for a job. That is a lot of time!
                        </p>
                        <h3 className="text-xl font-black uppercase tracking-tight text-primary-600">Spend 15 minutes instead</h3>
                        <p>
                            ProBoost finds jobs for you while you sleep. We check all the job boards and find the best ones before they even show up on LinkedIn.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                            <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                <h4 className="font-black text-primary-600 uppercase mb-4 tracking-widest text-xs">Step 1: The Scan</h4>
                                <p className="text-sm leading-relaxed">I check millions of data points to find roles that match your DNA. No more mindless scrolling.</p>
                            </div>
                            <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                <h4 className="font-black text-primary-600 uppercase mb-4 tracking-widest text-xs">Step 2: The Pitch</h4>
                                <p className="text-sm leading-relaxed">I write the perfect cover letter and LinkedIn post for you. You just hit 'send' and look like a pro.</p>
                            </div>
                        </div>
                    </div>
                </article>

                <article id="why-us" className="grid grid-cols-1 lg:grid-cols-12 gap-12 group pt-20">
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-primary-600 font-black text-4xl">02</span>
                                <div className="h-0.5 flex-grow bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Why <br />us?</h2>
                            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Built Different</p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 space-y-12">
                        <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-3xl">
                            <h3 className="text-3xl font-black tracking-tighter uppercase mb-6 text-primary-400">Trust & Speed</h3>
                            <p className="text-xl text-slate-400 leading-relaxed mb-8 font-medium">
                                Other tools just rewrite your text. We actually **understand** what recruiters want in 2025.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-black">1</div>
                                    <p className="font-bold">Real-time Search: We don't guess. We search live data.</p>
                                </div>
                                <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-black">2</div>
                                    <p className="font-bold">Private & Secure: Your data is never sold. Period.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                <article id="about-us" className="grid grid-cols-1 lg:grid-cols-12 gap-12 group pt-20 pb-20">
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-primary-600 font-black text-4xl">03</span>
                                <div className="h-0.5 flex-grow bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">About <br />us</h2>
                            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Our Mission</p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-2xl text-slate-600 dark:text-slate-300 font-serif italic mb-10 leading-relaxed">
                            "I built ProBoost because I saw my friends struggling with job hunting even though they were amazing at what they did."
                        </p>
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-3xl text-slate-400 border-4 border-white shadow-xl">S</div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase m-0">Samuel</h4>
                                <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">Platform Creator</p>
                            </div>
                        </div>
                        <p>
                            Our goal is to give every professional an "Unfair Advantage." Whether you're a student looking for your first role or a CEO building a big brand, we want you to reach your goals faster.
                        </p>
                    </div>
                </article>
            </div>
        </div>
    );
};

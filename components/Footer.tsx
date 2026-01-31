
import React, { useState, useEffect } from 'react';
import { FeatureName } from '../types.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Spinner } from './common/Spinner.tsx';

interface FooterProps {
  onSelectFeature: (feature: FeatureName) => void;
}

const NEWSLETTER_KEY = 'proboost-newsletter-subscribed';

export const Footer: React.FC<FooterProps> = ({ onSelectFeature }) => {
  const { t } = useAppContext();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem(NEWSLETTER_KEY) === 'true';
  });

  const handleResourceClick = (anchor: string) => {
    onSelectFeature(FeatureName.Resources);
    setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubscribed(true);
    localStorage.setItem(NEWSLETTER_KEY, 'true');
    setEmail('');
  };

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Opt-in Section */}
        <div className="mb-24 bg-slate-900 dark:bg-slate-900/50 rounded-[2.5rem] p-8 md:p-12 border border-white/5 overflow-hidden relative group">
          <div className="absolute inset-0 bg-primary-600/5 pointer-events-none group-hover:bg-primary-600/10 transition-colors duration-1000"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 bg-primary-400/10 px-3 py-1 rounded-full border border-primary-400/20">Early Access</span>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">{t('footer_newsletter_title')}</h3>
              </div>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
                {t('footer_newsletter_desc')}
              </p>
            </div>
            
            <div className="relative">
              {isSubscribed ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center animate-fade-in">
                  <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="text-white font-black text-xl mb-1 uppercase tracking-tight">{t('footer_newsletter_success')}</h4>
                  <p className="text-green-400/80 text-sm font-bold uppercase tracking-widest">Verification Sent</p>
                  <button 
                    onClick={() => { setIsSubscribed(false); localStorage.removeItem(NEWSLETTER_KEY); }}
                    className="mt-4 text-[9px] text-slate-500 uppercase font-black hover:text-slate-400 transition-colors"
                  >
                    Reset preferences
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 rounded-3xl border border-white/10 focus-within:border-primary-500/50 transition-all">
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('footer_newsletter_placeholder')}
                      className="flex-grow bg-transparent border-none text-white px-6 py-4 focus:ring-0 text-sm font-medium placeholder:text-slate-500"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest px-10 py-4 rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3 whitespace-nowrap active:scale-95"
                    >
                      {isSubmitting ? <Spinner size="sm" className="text-white" /> : null}
                      {t('footer_newsletter_button')}
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {t('footer_newsletter_privacy')}
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase text-primary-400/50 border border-primary-400/20 px-1.5 py-0.5 rounded">AES-256 Secured</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-8 mb-24">
          {/* Brand & Developer Credit */}
          <div className="space-y-8 lg:col-span-1">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onSelectFeature(null as any)}>
                <div className="bg-primary-600 p-2.5 rounded-2xl shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311l-3.75 0M12 6.75l-3.75 3.75M12 6.75l3.75 3.75" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase group-hover:text-primary-600 transition-colors">ProBoost AI</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              The world's leading <strong>Career AI platform</strong>. We specialize in <strong>Interview Prep AI</strong>, <strong>Live Job Discovery</strong>, and <strong>LinkedIn Brand Optimization</strong> for top-tier professionals.
            </p>
            <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Platform Creator</p>
                <a 
                  href="mailto:Samuel@aimoneygigs.com" 
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-all group"
                >
                  Samuel@aimoneygigs.com
                  <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2.5}/></svg>
                </a>
            </div>
          </div>

          <div className="lg:col-span-2 lg:pl-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-2">Professional Suite</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <ul className="space-y-4">
                <li><button onClick={() => onSelectFeature(FeatureName.InterviewPrep)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left group flex items-center gap-2">Interview Prep Pro <span className="text-[8px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">NEW</span></button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.JobSearch)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Live Job Search AI</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.JobFetcher)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Smart JD Fetcher</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.ProfileOptimizer)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Profile SEO Optimizer</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.JobApplication)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">ATS Application Bot</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.History)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">History & Projects</button></li>
              </ul>
              <ul className="space-y-4">
                <li><button onClick={() => onSelectFeature(FeatureName.NewsToPost)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">News-to-Viral AI</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.NetworkingAssistant)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Networking & DM Pro</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.ContentGenerator)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">AI Content Generator</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.ProfileCreator)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">LinkedIn Profile Creator</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.CaseStudyWriter)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Case Studies & Stories</button></li>
                <li><button onClick={() => onSelectFeature(FeatureName.JobPostCreator)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Job Vacancy Posts</button></li>
              </ul>
            </div>
          </div>

          <div className="lg:pl-8 lg:col-span-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-2">Strategies</h3>
            <ul className="space-y-4">
              <li><button onClick={() => handleResourceClick('live-job-hunting')} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Modern Job Hunting Guide</button></li>
              <li><button onClick={() => handleResourceClick('interview-prep-mastery')} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Behavioral Mastery Framework</button></li>
              <li><button onClick={() => handleResourceClick('jd-optimization')} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">ATS Semantic Mapping</button></li>
            </ul>
          </div>

          <div className="lg:pl-8 lg:col-span-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-2">Platform</h3>
            <ul className="space-y-4">
              <li><button onClick={() => onSelectFeature(FeatureName.Privacy)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Privacy Data Shield</button></li>
              <li><button onClick={() => onSelectFeature(FeatureName.Terms)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left">Terms of Service</button></li>
              <li><button onClick={() => onSelectFeature(FeatureName.Resources)} className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-all font-bold text-left underline decoration-primary-300">Support Knowledgebase</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Real-time Discovery</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                Our <strong>Real-time Job Finder</strong> scans global career indices every second, giving you a competitive lead in the professional market.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Interview Coaching</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                Master <strong>behavioral interview questions</strong> with ProBoost's AI-generated <strong>STAR Method scripts</strong> tailored to your target company culture.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">JD Synthesis</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                Synthesize high-authority requirements using our <strong>Smart JD Fetcher</strong> to ensure your <strong>ATS resume</strong> is mathematically optimized for success.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Authority Branding</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                Dominate the algorithm with <strong>viral LinkedIn content</strong> and <strong>professional profile optimization</strong> powered by Google Gemini 3.
              </p>
            </div>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {currentYear} ProBoost Career Intelligence. All AI Content Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
             <span className="text-[9px] font-black uppercase text-primary-600/60 border border-primary-100 dark:border-primary-900/50 px-2 py-1 rounded">Gemini 3 Pro Verified</span>
             <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
             <span className="text-[9px] font-black uppercase text-slate-400">Soc2 Type II Pending</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

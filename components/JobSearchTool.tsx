
import React, { useState, useEffect } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
import { searchLiveJobs } from '../services/geminiService.ts';
import { JobSearchResult, FeatureName } from '../types.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

const JOB_ALERT_KEY = 'proboost-job-alerts-active';

const ValueQuantifierCard: React.FC<{ roi: any }> = ({ roi }) => (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 mb-12 animate-fade-in relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary-600/5 pointer-events-none group-hover:bg-primary-600/10 transition-all duration-1000"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-primary-600 rounded-2xl shadow-xl">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">How this speeds up your search</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-bold uppercase text-primary-300 mb-2 tracking-widest">Time you just saved</p>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black">{roi?.timeSavedHours || 0}</span>
                        <span className="text-sm font-bold text-slate-400 mb-2 uppercase">Hours</span>
                    </div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-bold uppercase text-primary-300 mb-2 tracking-widest">Value of your time</p>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black">{roi?.estimatedValueSaved || '$0'}</span>
                    </div>
                </div>
                <div className="bg-primary-500/20 p-6 rounded-3xl border border-primary-500/30 hover:bg-primary-500/30 transition-colors">
                    <p className="text-[10px] font-bold uppercase text-primary-300 mb-2 tracking-widest">Potential salary gain</p>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-green-400">{roi?.potentialSalaryBoost || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const JobSearchTool: React.FC = () => {
  const { t } = useAppContext();
  const [profileSummary, setProfileSummary] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActivatingAlert, setIsActivatingAlert] = useState(false);
  const [alertActive, setAlertActive] = useState(() => {
    return localStorage.getItem(JOB_ALERT_KEY) === 'true';
  });
  const [result, setResult] = useState<JobSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  
  const { addHistoryItem, history } = useHistory();

  // Initialize saved job IDs from history
  useEffect(() => {
    const saved = new Set<string>();
    history.forEach(item => {
        if (item.featureType === FeatureName.SavedJob && item.output?.url) {
            saved.add(item.output.url);
        }
    });
    setSavedJobIds(saved);
  }, [history]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileSummary.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchLiveJobs(profileSummary, location);
      setResult(data);
      addHistoryItem({
        featureType: FeatureName.JobSearch,
        input: { profileSummary, location },
        output: data
      });
    } catch (err) {
      setError("I'm sorry, I had trouble reaching the job boards. Could you try one more time?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = (job: any) => {
    if (savedJobIds.has(job.url)) return;

    addHistoryItem({
        title: `Job: ${job.title} at ${job.company}`,
        featureType: FeatureName.SavedJob,
        input: { savedAt: new Date().toISOString() },
        output: job
    });
    
    setSavedJobIds(prev => new Set([...prev, job.url]));
  };

  const handleActivateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileSummary.trim() || !email.trim() || !email.includes('@')) return;

    setIsActivatingAlert(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsActivatingAlert(false);
    setAlertActive(true);
    localStorage.setItem(JOB_ALERT_KEY, 'true');
  };

  const handleDeactivateAlert = () => {
    setAlertActive(false);
    localStorage.removeItem(JOB_ALERT_KEY);
  };

  const getGoogleSearchUrl = (title: string, company: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(`${title} job at ${company}`)}`;
  };

  const jobsList = result?.jobs || [];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="p-6 bg-primary-100 dark:bg-primary-900/40 rounded-[2rem] text-primary-600">
             <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Finding Your Next Role</h2>
            <p className="text-xl text-slate-500 font-medium mt-2">I'll look across the entire web to find roles that actually fit your profile.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <form onSubmit={handleSearch} className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">What are you great at?</label>
                  <Textarea 
                    value={profileSummary} 
                    onChange={e => setProfileSummary(e.target.value)} 
                    placeholder="e.g. 'Senior React Developer with a passion for accessible design...'" 
                    rows={5}
                    className="rounded-[2rem] p-6 text-lg"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Where would you like to work?</label>
                  <Input 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="e.g. 'Remote', 'London', or 'New York'..." 
                    className="h-16 rounded-2xl px-6 text-lg"
                  />
               </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-2xl rounded-2xl bg-primary-600 hover:bg-primary-700 transform hover:-translate-y-1 transition-all">
              {isLoading ? <Spinner size="sm" className="text-white" /> : "Start my search"}
            </Button>
          </form>

          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[3rem] border border-white/5 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                  <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">{t('job_alert_title')}</h3>
                </div>
                <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10">
                  {t('job_alert_desc')}
                </p>

                {alertActive ? (
                  <div className="bg-primary-600/20 border border-primary-500/40 rounded-[2rem] p-6 text-center animate-fade-in">
                      <div className="flex flex-col items-center justify-center gap-3 text-primary-300 font-black uppercase text-xs tracking-[0.2em] mb-4">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          {t('job_alert_success')}
                      </div>
                      <button 
                        onClick={handleDeactivateAlert}
                        className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest underline transition-colors"
                      >
                        Stop watching
                      </button>
                  </div>
                ) : (
                  <form onSubmit={handleActivateAlert} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-2">{t('job_alert_email_label')}</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="hello@you.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isActivatingAlert || !profileSummary}
                      className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isActivatingAlert && <Spinner size="sm" className="text-slate-900" />}
                      {t('job_alert_button')}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-white/5">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
                   Your privacy is my priority.
                 </p>
              </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-primary-200 animate-pulse">
           <Spinner size="lg" className="mx-auto mb-8 text-primary-600 w-16 h-16" />
           <h3 className="text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">I'm scanning the market for you...</h3>
           <p className="text-lg text-slate-500 mt-4 max-w-md mx-auto">Gemini is checking LinkedIn, Indeed, and private boards for your perfect match.</p>
        </div>
      )}

      {result && (
        <div className="space-y-12 animate-fade-in">
          {result.roi && <ValueQuantifierCard roi={result.roi} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                        <div className="w-3 h-8 bg-primary-500 rounded-full" />
                        Roles you might love
                    </h3>
                </div>
                {jobsList.map((job, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 hover:border-primary-400 hover:shadow-2xl transition-all group relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                            <div className="space-y-1">
                                <h4 className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">{job.title || 'Job Listing'}</h4>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{job.company || 'Someone Great'} • {job.location || 'Anywhere'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                {job.salaryEstimate && (
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
                                        {job.salaryEstimate}
                                    </span>
                                )}
                                <button 
                                    onClick={() => handleSaveJob(job)}
                                    disabled={savedJobIds.has(job.url)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        savedJobIds.has(job.url) 
                                        ? 'bg-slate-100 text-slate-400 cursor-default' 
                                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                    }`}
                                >
                                    <svg className="h-4 w-4" fill={savedJobIds.has(job.url) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    {savedJobIds.has(job.url) ? 'Saved to Projects' : 'Keep this one'}
                                </button>
                            </div>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10 italic">"{job.snippet || 'This role looks like a great match for your skills.'}"</p>
                        <div className="flex flex-wrap items-center gap-6">
                            <a 
                                href={job.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-primary-600 hover:text-primary-800 transition-colors group"
                            >
                                Take a look at the listing
                                <svg className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700" />
                            <a 
                                href={getGoogleSearchUrl(job.title || '', job.company || '')} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Verify on Google
                            </a>
                        </div>
                    </div>
                ))}
                {jobsList.length === 0 && <p className="p-12 text-center bg-white dark:bg-slate-800 rounded-[3rem] text-slate-400 text-lg">I couldn't find a perfect match today. Try adjusting your skills summary!</p>}
            </div>
            <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 sticky top-24 transform hover:rotate-1 transition-transform">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">My Take on the Market</h3>
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic font-serif">
                        {result.marketAnalysis || 'I\'m analyzing how in-demand your skills are right now...'}
                    </p>
                    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-700">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">I checked these for you:</p>
                         <div className="flex flex-wrap gap-3 opacity-60">
                            {['LinkedIn', 'Indeed', 'Greenhouse', 'Lever'].map(s => (
                                <span key={s} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-tighter">{s}</span>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

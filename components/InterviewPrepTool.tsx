
import React, { useState, useEffect } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
import { generateInterviewGuide } from '../services/geminiService.ts';
import { InterviewPrepAssets, FeatureName } from '../types.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { ActionButtons } from './common/ActionButtons.tsx';

const LOADING_THOUGHTS = [
    "I'm checking out what people say about this company...",
    "I'm looking for the questions they like to ask...",
    "Thinking about how to share your big wins...",
    "Learning about the company culture...",
    "Just a second, I'm finishing your guide!"
];

const ValueQuantifierCard: React.FC<{ roi: any }> = ({ roi }) => (
    <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl border border-primary-500/20 mb-12 animate-fade-in overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 bg-primary-400/10 px-4 py-1.5 rounded-full">Your Career Friend</span>
                    <h3 className="text-2xl font-black uppercase">How I'm helping you</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed italic">"{roi?.marketValueDescription || 'Helping you feel ready and relaxed.'}"</p>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-bold uppercase text-primary-300 mb-2">Time saved</p>
                    <p className="text-4xl font-black">{roi?.timeSavedHours || 0}h</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold">Of hard work</p>
                </div>
                <div className="p-6 bg-primary-500/10 rounded-3xl border border-primary-500/20 text-center hover:bg-primary-500/20 transition-colors">
                    <p className="text-[10px] font-bold uppercase text-primary-300 mb-2">Money value</p>
                    <p className="text-4xl font-black text-green-400">{roi?.estimatedValueSaved || '$0'}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold">Of your time</p>
                </div>
            </div>
        </div>
    </div>
);

export const InterviewPrepTool: React.FC = () => {
    const [jobDetails, setJobDetails] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [result, setResult] = useState<InterviewPrepAssets | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addHistoryItem } = useHistory();

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingIndex(prev => (prev + 1) % LOADING_THOUGHTS.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobDetails.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await generateInterviewGuide(jobDetails, companyName);
            setResult(data);
            addHistoryItem({
                featureType: FeatureName.InterviewPrep,
                input: { jobDetails, companyName },
                output: data
            });
        } finally {
            setIsLoading(false);
        }
    };

    const questionsList = result?.questions || [];

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <div className="p-6 bg-primary-500 text-white rounded-[2rem] shadow-xl transform rotate-3">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Practice for your big day</h2>
                        <p className="text-xl text-slate-500 font-medium mt-2">Paste the job info below. I'll help you figure out what to say to get the job.</p>
                    </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="md:col-span-2 space-y-3">
                             <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Job Description</label>
                             <Textarea value={jobDetails} onChange={e => setJobDetails(e.target.value)} placeholder="Paste the job requirements here..." rows={6} className="rounded-3xl p-6" required />
                        </div>
                        <div className="space-y-3">
                             <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Company Name</label>
                             <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google, Stripe..." className="h-16 rounded-2xl px-6" />
                             <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">If you give me the name, I can find out more about them for you.</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-2xl rounded-2xl bg-primary-600 hover:bg-primary-700 transform hover:-translate-y-1 transition-all">
                        {isLoading ? <Spinner size="sm" className="text-white" /> : "Make my guide"}
                    </Button>
                </form>
            </div>

            {isLoading && (
                <div className="text-center py-40 bg-slate-50 dark:bg-slate-900/30 rounded-[4rem] border-4 border-dashed border-primary-100 animate-in fade-in duration-700">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <Spinner size="lg" className="text-primary-600 w-20 h-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-primary-100 rounded-full animate-ping"></div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white transition-all duration-500">{LOADING_THOUGHTS[loadingIndex]}</h3>
                    <p className="text-slate-500 mt-4 font-medium text-lg">I'm getting everything ready for you.</p>
                </div>
            )}

            {result && (
                <div className="space-y-16 animate-fade-in">
                    <ValueQuantifierCard roi={result.roi} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-12">
                            <section className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-visible border border-slate-100 dark:border-slate-700 group">
                                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center rounded-t-[3rem] border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">My Advice</h3>
                                    <ActionButtons textToCopy={result.strategicGuide || ''} downloadableText={result.strategicGuide || ''} downloadFilename="prep-strategy" onTranslate={(t) => setResult({...result, strategicGuide: t})} />
                                </div>
                                <div className="p-10">
                                    <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic group-hover:text-slate-900 dark:group-hover:text-white transition-colors">"{result.strategicGuide || 'I am writing your guide now.'}"</p>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center justify-between px-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                                        <div className="w-3 h-8 bg-primary-500 rounded-full" />
                                        Questions to practice
                                    </h3>
                                    <span className="text-[10px] font-black uppercase bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-2 rounded-full border border-green-200">Just for you</span>
                                </div>
                                
                                {questionsList.map((q, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                                            <span className="text-9xl font-black">{i+1}</span>
                                        </div>
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <div className="bg-primary-50 dark:bg-primary-900/30 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-primary-600 border border-primary-100 dark:border-primary-700">{i+1}</div>
                                            <ActionButtons textToCopy={`${q.question || ''}\n\nWHY THEY ASK:\n${q.whyTheyAsk || ''}\n\nHOW TO ANSWER:\n${q.howToAnswer || ''}`} downloadableText={`${q.question || ''}\n\n${q.whyTheyAsk || ''}\n\n${q.howToAnswer || ''}`} downloadFilename={`question-${i+1}`} layout="social" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-8 leading-tight relative z-10">{q.question || 'Loading question...'}</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-50 dark:border-slate-700 relative z-10">
                                            <div>
                                                <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">What they really want to know</h5>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{q.whyTheyAsk || 'I am thinking about the reason for this question.'}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-500">How you should answer</h5>
                                                    <span className="text-[9px] font-bold text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">Try this</span>
                                                </div>
                                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                                                        {q.howToAnswer || 'I am writing a great answer for you.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>

                        <div className="space-y-8">
                             <div className="bg-primary-600 text-white p-10 rounded-[3rem] shadow-2xl sticky top-24 transform hover:-rotate-1 transition-transform">
                                <div className="flex items-center gap-4 mb-8">
                                     <div className="p-2 bg-white/20 rounded-xl">
                                         <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                     </div>
                                     <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-90">What I found</h3>
                                </div>
                                <p className="text-lg font-medium leading-relaxed italic border-l-4 border-white/30 pl-6 mb-10">
                                    {result.companyInsights || 'I found some really interesting things about this place. Here is the news...'}
                                </p>
                                <div className="pt-10 border-t border-white/10">
                                     <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-6">Where I looked</p>
                                     <div className="flex flex-wrap gap-3">
                                        {['Glassdoor', 'LinkedIn', 'Indeed', 'Reddit'].map(s => (
                                            <span key={s} className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-tighter">{s}</span>
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
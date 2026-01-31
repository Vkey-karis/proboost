
import React, { useState } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { Spinner } from './common/Spinner.tsx';
import { fetchOptimizedJobDescription } from '../services/geminiService.ts';
import { JobDescriptionAssets, FeatureName } from '../types.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { ActionButtons } from './common/ActionButtons.tsx';

const ValueQuantifierCard: React.FC<{ roi: any }> = ({ roi }) => (
    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-primary-500/20 mb-12 animate-fade-in overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 bg-primary-400/10 px-3 py-1 rounded-full">ProBoost Intelligence</span>
                    <h3 className="text-xl font-black uppercase">Strategic Asset Valuation</h3>
                </div>
                <p className="text-slate-400 text-sm italic">"{roi?.marketValueDescription || 'Evaluating time saved.'}"</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[9px] font-bold uppercase text-primary-300 mb-1">Expert Time Saved</p>
                    <p className="text-3xl font-black">{roi?.timeSavedHours || 0}h</p>
                </div>
                <div className="p-4 bg-primary-500/10 rounded-2xl border border-primary-500/20 text-center">
                    <p className="text-[9px] font-bold uppercase text-primary-300 mb-1">Financial Value</p>
                    <p className="text-3xl font-black text-green-400">{roi?.estimatedValueSaved || '$0'}</p>
                </div>
            </div>
        </div>
    </div>
);

export const JobDescriptionFetcher: React.FC = () => {
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<JobDescriptionAssets | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addHistoryItem } = useHistory();

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchOptimizedJobDescription(role, industry);
            setResult(data);
            addHistoryItem({
                featureType: FeatureName.JobFetcher,
                input: { role, industry },
                output: data
            });
        } catch (err) {
            setError("Failed to fetch JD. The AI search tool timed out. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const questions = result?.interviewQuestions || [];
    const requirements = result?.requirements || [];

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-6 mb-10">
                    <div className="p-4 bg-primary-500 text-white rounded-[1.5rem] shadow-lg">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Smart JD Fetcher</h2>
                        <p className="text-slate-500 font-medium">Auto-generate 2025-ready, high-authority Job Descriptions by role.</p>
                    </div>
                </div>

                <form onSubmit={handleFetch} className="flex flex-col md:flex-row gap-6">
                    <div className="flex-grow">
                        <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. 'Senior Director of AI Ethics'..." className="h-14 text-lg" required />
                    </div>
                    <div className="md:w-64">
                        <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry (optional)" className="h-14 text-lg" />
                    </div>
                    <Button type="submit" disabled={isLoading} className="h-14 px-10 text-sm font-black uppercase tracking-widest shadow-xl">
                        {isLoading ? <Spinner size="sm" /> : 'Fetch Assets'}
                    </Button>
                </form>
            </div>

            {isLoading && (
                <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-primary-200">
                    <Spinner size="lg" className="mx-auto mb-6 text-primary-600" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Synthesizing Market Data...</h3>
                    <p className="text-slate-500 mt-2">Gemini is scanning global employment requirements for the "{role}" position.</p>
                </div>
            )}

            {result && (
                <div className="space-y-12 animate-fade-in">
                    <ValueQuantifierCard roi={result.roi} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-visible border border-slate-100 dark:border-slate-700">
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center rounded-t-3xl border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Optimized Description</h3>
                                <ActionButtons textToCopy={result.jobDescription} downloadableText={result.jobDescription} downloadFilename="optimized-jd" layout="social" />
                            </div>
                            <div className="p-10">
                                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                                    {result.jobDescription || 'No description generated.'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-primary-600 text-white p-8 rounded-3xl shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-80">Strategic Interview Toolkit</h3>
                                <div className="space-y-4">
                                    {questions.map((q, i) => (
                                        <div key={i} className="bg-white/10 p-4 rounded-xl border border-white/10 flex gap-4">
                                            <span className="text-xl font-black opacity-40">{i+1}</span>
                                            <p className="text-sm font-medium leading-relaxed">{q}</p>
                                        </div>
                                    ))}
                                    {questions.length === 0 && <p className="text-sm opacity-60 italic">No interview questions generated.</p>}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Core Capability Requirements</h3>
                                <div className="flex flex-wrap gap-2">
                                    {requirements.map((req, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                                            {req}
                                        </span>
                                    ))}
                                    {requirements.length === 0 && <p className="text-xs text-slate-400 italic">No specific requirements extracted.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

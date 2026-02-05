
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './common/Button.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
import { generateApplicationAssets } from '../services/geminiService.ts';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { useHistory } from '../hooks/useHistory.ts';
import { FeatureName, ProfileTemplate, ApplicationAssets } from '../types.ts';
import { Input } from './common/Input.tsx';
import { downloadAsPdf, downloadAsDocx } from '../utils/export.ts';
import { ActionButtons } from './common/ActionButtons.tsx';
import { TemplateSelector } from './common/TemplateSelector.tsx';

// Set up pdf.js worker to enable PDF parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface AssetDisplayCardProps {
    title: string;
    content: string;
    template: ProfileTemplate;
    onUpdate: (newContent: string) => void;
    atsCompliant?: boolean;
}

const AssetDisplayCard: React.FC<AssetDisplayCardProps> = ({ title, content, template, onUpdate, atsCompliant }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
    const [editBuffer, setEditBuffer] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Sync buffer when content changes externally
    useEffect(() => {
        setEditBuffer(content);
    }, [content]);

    const handleSave = async () => {
        setIsSaving(true);
        // Add a tiny human-like delay for the "processing" feel
        await new Promise(resolve => setTimeout(resolve, 600));
        onUpdate(editBuffer);
        setIsSaving(false);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const getTemplateClasses = () => {
        if (viewMode === 'raw' && !isEditing) return 'font-mono bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400';

        switch (template) {
            case 'modern': return 'font-sans border-t-8 border-primary-600 bg-white';
            case 'classic': return 'font-serif border-t-2 border-slate-900 bg-white';
            case 'minimalist': return 'font-sans text-slate-900 bg-white border-slate-100';
            default: return '';
        }
    };

    const renderFormattedContent = () => {
        return content.split('\n').map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-4" />;

            const isHeading = /^[A-Z\s]{4,}:?$/.test(trimmed) || (trimmed.startsWith('**') && trimmed.endsWith('**'));
            const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed);

            if (isHeading) {
                const headingText = trimmed.replace(/\*\*/g, '').toUpperCase();
                return (
                    <div key={idx} className="mt-8 mb-3">
                        <h4 className={`text-base font-bold tracking-widest ${template === 'modern' ? 'text-primary-700' : 'text-slate-900'}`}>
                            {headingText}
                        </h4>
                        <div className={`h-[1.5px] w-full mt-1 ${template === 'modern' ? 'bg-primary-100' : 'bg-slate-200'}`} />
                    </div>
                );
            }

            if (isBullet) {
                return (
                    <div key={idx} className="flex gap-4 mb-2 pl-2">
                        <span className={`flex-shrink-0 mt-0.5 ${template === 'modern' ? 'text-primary-500' : 'text-slate-400'}`}>•</span>
                        <p className="text-[14px] leading-relaxed text-slate-700">{trimmed.replace(/^[-•*]\s*/, '')}</p>
                    </div>
                );
            }

            return (
                <p key={idx} className="text-[14px] leading-relaxed text-slate-700 mb-3">
                    {trimmed}
                </p>
            );
        });
    };

    return (
        <div className="bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-visible mb-12 max-w-[850px] mx-auto border border-slate-200 dark:border-slate-800 transition-all duration-300">
            {/* Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-900/80 px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 rounded-t-[2rem] overflow-visible relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">{title}</h3>
                        {atsCompliant && <span className="text-[9px] font-bold text-green-600 tracking-tighter uppercase">ATS Strategy Applied</span>}
                    </div>

                    {!isEditing && (
                        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('preview')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Reading View
                            </button>
                            <button
                                onClick={() => setViewMode('raw')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'raw' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Raw Text
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 overflow-visible relative">
                    {showSuccess && (
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-fade-in flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Perfected!
                        </span>
                    )}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md ${isEditing
                            ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
                            }`}
                    >
                        {isSaving ? (
                            <Spinner size="sm" className="text-white" />
                        ) : isEditing ? (
                            'Done, apply these'
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                I'd like to tweak this
                            </>
                        )}
                    </button>
                    {!isEditing && (
                        <ActionButtons
                            textToCopy={content}
                            downloadFilename={title.toLowerCase().replace(/\s+/g, '-')}
                            downloadableText={content}
                            layout="social"
                            onTranslate={onUpdate}
                        />
                    )}
                </div>
            </div>

            {/* Coach Tip Overlay when editing */}
            {isEditing && (
                <div className="bg-primary-50 dark:bg-primary-900/30 px-8 py-3 border-b border-primary-100 dark:border-primary-800 flex items-center gap-3 animate-slide-in-top">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">!</div>
                    <p className="text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest">
                        {title.includes('Resume')
                            ? "Coach Tip: Make sure your metric-heavy wins (like '% increase' or '$ saved') stay in bold!"
                            : "Coach Tip: Mentioning a specific company goal here makes your application 3x more memorable."}
                    </p>
                </div>
            )}

            {/* Document Surface */}
            <div className={`p-12 sm:p-20 min-h-[900px] shadow-inner transition-all duration-500 overflow-hidden relative ${getTemplateClasses()}`}>
                {isEditing ? (
                    <div className="animate-fade-in h-full flex flex-col">
                        <textarea
                            value={editBuffer}
                            onChange={(e) => setEditBuffer(e.target.value)}
                            className="w-full flex-grow min-h-[800px] font-mono text-[14px] border-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-300"
                            placeholder="Type your improvements here..."
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {viewMode === 'raw' ? (
                            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-slate-600 dark:text-slate-400">
                                {content}
                            </pre>
                        ) : (
                            renderFormattedContent()
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Indicator */}
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-center rounded-b-[2rem]">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-50">Document Ends Here</span>
            </div>
        </div>
    );
};

const ValueQuantifierCard: React.FC<{ roi: ApplicationAssets['roiAnalysis'] }> = ({ roi }) => (
    <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 mb-12 animate-fade-in relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary-600/5 pointer-events-none group-hover:bg-primary-600/10 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-md">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-600 rounded-2xl shadow-xl">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase">Success Strategy</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed italic border-l-4 border-white/20 pl-6">
                    "{roi.marketValueDescription}"
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full md:w-auto">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300 mb-2">Time Saved</p>
                    <p className="text-4xl font-black">{roi.timeSavedHours}h</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300 mb-2">Saved Value</p>
                    <p className="text-4xl font-black">{roi.estimatedValueSaved}</p>
                </div>
                <div className="p-6 bg-primary-500/20 rounded-3xl border border-primary-500/40 hover:bg-primary-500/30 transition-colors text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300 mb-2">Upside Potential</p>
                    <p className="text-4xl font-black text-green-400">{roi.potentialSalaryBoost}</p>
                </div>
            </div>
        </div>
    </div>
);

const InputTypeTab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors";
    const activeClasses = "border-primary-500 text-primary-600 dark:text-primary-400";
    const inactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300";

    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};

interface AppAssistantState {
    jobDescription: string;
    resumeInfo: string;
    userEmail: string;
    template: ProfileTemplate;
    atsCompliance: boolean;
    generatedAssets: ApplicationAssets | null;
    targetJobTitle: string; // [NEW] Save target job title in history
}

export const ApplicationAssistant: React.FC = () => {
    const [jdInputType, setJdInputType] = useState<'paste' | 'url' | 'file'>('paste');
    const [historyInputType, setHistoryInputType] = useState<'text' | 'bullets'>('text');
    const [targetJobTitle, setTargetJobTitle] = useState(''); // [NEW] Target Job Title state
    const [jobDescription, setJobDescription] = useState('');
    const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
    const [resumeInfo, setResumeInfo] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [template, setTemplate] = useState<ProfileTemplate>('modern');
    const [atsCompliance, setAtsCompliance] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [isReadingResumeFile, setIsReadingResumeFile] = useState(false);
    const [isReadingJdFile, setIsReadingJdFile] = useState(false);
    const [isScrapingUrl, setIsScrapingUrl] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [generatedAssets, setGeneratedAssets] = useState<ApplicationAssets | null>(null);
    const [lastState, setLastState] = useState<AppAssistantState | null>(null);

    const { addHistoryItem } = useHistory();

    const parseFileToText = async (file: File): Promise<string> => {
        let text = '';
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                text += '\n';
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else if (file.type === 'text/plain') {
            text = await file.text();
        } else {
            throw new Error('Unsupported file. Please upload .txt, .pdf, or .docx');
        }
        return text;
    };

    const handleUndo = useCallback(() => {
        if (!lastState) return;
        setJobDescription(lastState.jobDescription);
        setResumeInfo(lastState.resumeInfo);
        setUserEmail(lastState.userEmail);
        setTemplate(lastState.template);
        setAtsCompliance(lastState.atsCompliance);
        setGeneratedAssets(lastState.generatedAssets);
        setTargetJobTitle(lastState.targetJobTitle); // [NEW] Restore target job title
        setLastState(null);
    }, [lastState]);

    const handleResumeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsReadingResumeFile(true);
        setError(null);
        try {
            const text = await parseFileToText(file);
            setResumeInfo(text);
            setHistoryInputType('text'); // Switch to text mode if a file is uploaded
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to read resume file.');
        } finally {
            setIsReadingResumeFile(false);
            event.target.value = '';
        }
    };

    const handleJdFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsReadingJdFile(true);
        setError(null);
        try {
            const text = await parseFileToText(file);
            setJobDescription(text);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to read job description file.');
        } finally {
            setIsReadingJdFile(false);
            event.target.value = '';
        }
    };

    const handleUrlFetch = async () => {
        if (!jobDescriptionUrl.trim()) { setError('Please enter a URL.'); return; }
        setIsScrapingUrl(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setJobDescription(`Position: Senior AI Engineer\nCompany: FutureScale\nLocation: San Francisco (Hybrid)\n\nResponsibilities:\n- Develop and deploy large-scale generative AI models.\n- Optimize inference pipelines for low latency.\n- Lead cross-functional teams in technical product development.`);
        } catch (e) {
            setError('Failed to fetch JD from URL. Please paste it instead.');
        } finally {
            setIsScrapingUrl(false);
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobDescription.trim() || !resumeInfo.trim() || !userEmail.trim()) {
            setError('Please provide JD, Email, and Background information.');
            return;
        }

        // Save current state for undo
        setLastState({
            jobDescription,
            resumeInfo,
            userEmail,
            template,
            atsCompliance,
            targetJobTitle, // [NEW] Save target job title
            generatedAssets
        });

        setIsLoading(true);
        setError(null);
        setGeneratedAssets(null);
        try {
            const results = await generateApplicationAssets(jobDescription, resumeInfo, userEmail, template, atsCompliance, targetJobTitle); // [NEW] Pass targetJobTitle
            setGeneratedAssets(results);
            addHistoryItem({
                featureType: FeatureName.JobApplication,
                input: { jobDescription, resumeInfo, userEmail, template, atsCompliance, historyInputType, targetJobTitle }, // [NEW] Save in history
                output: results
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate assets.');
        } finally {
            setIsLoading(false);
        }
    }, [jobDescription, resumeInfo, userEmail, template, atsCompliance, historyInputType, generatedAssets, addHistoryItem, targetJobTitle]);

    const updateAssetContent = (key: keyof ApplicationAssets, newContent: string) => {
        setGeneratedAssets(prev => prev ? { ...prev, [key]: newContent } : null);
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-20">
            <div className="lg:w-1/3 w-full">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Application Lab</h2>
                        {lastState && (
                            <button
                                onClick={handleUndo}
                                className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors"
                                title="Undo last generation"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
                                </svg>
                                Undo
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6">
                            <TemplateSelector
                                label="Visual Style"
                                selected={template}
                                onSelect={setTemplate}
                            />
                        </div>

                        <div className="flex items-center justify-between p-5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
                            <div>
                                <label className="text-sm font-bold text-primary-800 dark:text-primary-300">ATS Smart Shield</label>
                                <p className="text-[10px] text-primary-600/70 dark:text-primary-400/70 font-bold uppercase tracking-widest">Optimizing for algorithms</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAtsCompliance(!atsCompliance)}
                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-4 ring-primary-500/10 ${atsCompliance ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out mt-0.5 ${atsCompliance ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2 mb-2">Target Job Title</label>
                                <Input
                                    type="text"
                                    value={targetJobTitle}
                                    onChange={(e) => setTargetJobTitle(e.target.value)}
                                    placeholder="e.g. Senior Product Manager"
                                    className="h-14 rounded-2xl px-6 font-bold text-lg"
                                />
                            </div>

                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Job Opportunity (Optional)</label>
                            <div className="border-b border-slate-100 dark:border-slate-800 mb-3">
                                <nav className="-mb-px flex space-x-6">
                                    <InputTypeTab active={jdInputType === 'paste'} onClick={() => setJdInputType('paste')}>Paste</InputTypeTab>
                                    <InputTypeTab active={jdInputType === 'url'} onClick={() => setJdInputType('url')}>URL</InputTypeTab>
                                    <InputTypeTab active={jdInputType === 'file'} onClick={() => setJdInputType('file')}>File</InputTypeTab>
                                </nav>
                            </div>
                            <div className="space-y-4">
                                {jdInputType === 'url' && (
                                    <div className="flex gap-2">
                                        <Input type="url" value={jobDescriptionUrl} onChange={(e) => setJobDescriptionUrl(e.target.value)} placeholder="LinkedIn or Indeed URL..." className="h-14 rounded-2xl px-6" />
                                        <Button type="button" onClick={handleUrlFetch} disabled={isScrapingUrl} variant="secondary" className="h-14 rounded-2xl px-6">
                                            {isScrapingUrl ? <Spinner size="sm" /> : 'Fetch'}
                                        </Button>
                                    </div>
                                )}
                                {jdInputType === 'file' && (
                                    <Button type="button" variant="secondary" onClick={() => document.getElementById('jd-upload')?.click()} disabled={isReadingJdFile} className="w-full h-14 rounded-2xl border-dashed border-2">
                                        {isReadingJdFile ? <Spinner size="sm" /> : 'Upload Listing Doc'}
                                        <input type="file" id="jd-upload" accept=".txt,.pdf,.docx" onChange={handleJdFileChange} className="hidden" />
                                    </Button>
                                )}
                                <Textarea rows={6} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="What are they looking for? Paste the requirements here..." className="rounded-3xl p-6" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2 mb-2">Your Contact Email</label>
                            <Input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="jane.doe@example.com" required className="h-14 rounded-2xl px-6" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Your Background</label>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                                    <InputTypeTab active={historyInputType === 'text'} onClick={() => setHistoryInputType('text')}>Text</InputTypeTab>
                                    <InputTypeTab active={historyInputType === 'bullets'} onClick={() => setHistoryInputType('bullets')}>Bullets</InputTypeTab>
                                </div>
                            </div>
                            <Button type="button" variant="secondary" onClick={() => document.getElementById('resume-upload')?.click()} disabled={isReadingResumeFile} className="w-full h-14 rounded-2xl border-dashed border-2 flex items-center justify-center gap-2">
                                {isReadingResumeFile ? <Spinner size="sm" /> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth={2.5} /></svg>}
                                Import Your Current CV
                                <input type="file" id="resume-upload" accept=".txt,.pdf,.docx" onChange={handleResumeFileChange} className="hidden" />
                            </Button>
                            <Textarea
                                rows={6}
                                value={resumeInfo}
                                onChange={(e) => setResumeInfo(e.target.value)}
                                placeholder={historyInputType === 'bullets' ? "List your biggest wins:\n- Managed $2M budget\n- Hired 10 engineers\n- 15% revenue lift" : "Paste your experience highlights or existing CV text here..."}
                                className="rounded-3xl p-6"
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] shadow-2xl rounded-2xl bg-primary-600 hover:bg-primary-700 transform hover:-translate-y-1 transition-all">
                            {isLoading ? <Spinner size="sm" className="mr-3 text-white" /> : null}
                            {isLoading ? 'Perfecting Assets...' : 'Generate My Application'}
                        </Button>
                        {error && <p className="text-sm text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 font-bold">{error}</p>}
                    </form>
                </div>
            </div>

            <div className="lg:w-2/3 w-full">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-12 bg-slate-50 dark:bg-slate-800/30 rounded-[4rem] border-4 border-dashed border-primary-100 animate-pulse">
                        <Spinner size="lg" className="text-primary-600 w-16 h-16" />
                        <h3 className="mt-8 text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Mapping Your Skills...</h3>
                        <p className="text-lg text-slate-500 mt-4 max-w-md">Gemini is mathematically aligning your experience with the job requirements to bypass ATS filters.</p>
                    </div>
                )}

                {generatedAssets && (
                    <div className="space-y-16 animate-fade-in overflow-visible relative">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl sticky top-[72px] z-[40] border border-slate-200 dark:border-slate-700 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Your Assets Are Ready</h2>
                                    <p className="text-xs text-slate-500 font-medium">Ready for review and export</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => downloadAsDocx('Full-Application', `RESUME\n\n${generatedAssets.resume}\n\nCOVER LETTER\n\n${generatedAssets.coverLetter}`)} className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-300 dark:border-slate-600">
                                    Download Bundle (.docx)
                                </Button>
                            </div>
                        </div>

                        <ValueQuantifierCard roi={generatedAssets.roiAnalysis} />

                        {/* [NEW] Job Keywords Section */}
                        <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">Power Keywords</h3>
                                    <p className="text-xs text-slate-500 font-medium">ATS-Optimized Skills for this Role</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {generatedAssets.jobKeywords.map((keyword, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* [NEW] LinkedIn Section */}
                        <section className="overflow-visible relative">
                            <div className="flex items-center gap-4 mb-8 px-4">
                                <div className="w-3 h-10 bg-[#0077b5] rounded-full" />
                                <h3 className="text-3xl font-black uppercase tracking-tight">LinkedIn Optimization</h3>
                            </div>

                            <div className="space-y-8">
                                <AssetDisplayCard
                                    title="High-Converting Headline"
                                    content={generatedAssets.linkedInHeadline}
                                    template={template}
                                    onUpdate={(c) => updateAssetContent('linkedInHeadline', c)}
                                />
                                <AssetDisplayCard
                                    title="Profile 'About' Section"
                                    content={generatedAssets.linkedInAbout}
                                    template={template}
                                    onUpdate={(c) => updateAssetContent('linkedInAbout', c)}
                                />
                            </div>
                        </section>

                        {/* [NEW] Interview Prep Section */}
                        <section className="overflow-visible relative">
                            <div className="flex items-center gap-4 mb-8 px-4">
                                <div className="w-3 h-10 bg-orange-500 rounded-full" />
                                <h3 className="text-3xl font-black uppercase tracking-tight">Interview Prep</h3>
                            </div>
                            <AssetDisplayCard
                                title="Tell Me About Yourself"
                                content={generatedAssets.interviewAnswer}
                                template={template}
                                onUpdate={(c) => updateAssetContent('interviewAnswer', c)}
                            />
                        </section>

                        <section className="overflow-visible relative">
                            <div className="flex items-center gap-4 mb-8 px-4">
                                <div className="w-3 h-10 bg-primary-500 rounded-full" />
                                <h3 className="text-3xl font-black uppercase tracking-tight">The Cover Letter</h3>
                            </div>
                            <AssetDisplayCard
                                title="Tailored Cover Letter"
                                content={generatedAssets.coverLetter}
                                template={template}
                                onUpdate={(c) => updateAssetContent('coverLetter', c)}
                                atsCompliant={lastState?.atsCompliance}
                            />
                        </section>

                        <section className="overflow-visible relative">
                            <div className="flex items-center gap-4 mb-8 px-4">
                                <div className="w-3 h-10 bg-primary-500 rounded-full" />
                                <h3 className="text-3xl font-black uppercase tracking-tight">The ATS Resume</h3>
                            </div>
                            <AssetDisplayCard
                                title="Optimized Resume"
                                content={generatedAssets.resume}
                                template={template}
                                onUpdate={(c) => updateAssetContent('resume', c)}
                                atsCompliant={lastState?.atsCompliance}
                            />
                        </section>
                    </div>
                )}

                {!isLoading && !generatedAssets && (
                    <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-20 bg-white dark:bg-slate-800 rounded-[4rem] shadow-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-full mb-10 shadow-inner ring-8 ring-primary-50 dark:ring-primary-900/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Perfect Your Pitch</h2>
                        <p className="text-xl text-slate-400 mt-4 max-w-lg mx-auto leading-relaxed">Fill out your job details and experience to forge high-authority, ATS-optimized application documents.</p>
                        <div className="mt-12 flex gap-4 opacity-30">
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

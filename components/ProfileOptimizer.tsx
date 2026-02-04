
import React, { useState, useCallback } from 'react';
import { Button } from './common/Button.tsx';
import { BackButton } from './common/BackButton.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Input } from './common/Input.tsx';
import { Spinner } from './common/Spinner.tsx';
import { optimizeLinkedInProfile, editProfilePhoto, generateProfilePhoto } from '../services/geminiService.ts';
import { extractLinkedInProfile } from '../services/linkedInService.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { FeatureName, OptimizedProfile } from '../types.ts';
import { ActionButtons } from './common/ActionButtons.tsx';
import { downloadImage, downloadAsDocx } from '../utils/export.ts';
import { useCredits } from '../hooks/useCredits.ts';

const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
            resolve({ mimeType, data });
        };
        reader.onerror = error => reject(error);
    });
};

const ProfileField: React.FC<{ label: string; content: string | string[]; original?: boolean }> = ({ label, content, original = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = Array.isArray(content) ? content.join(', ') : content;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</h4>
                {!original && content && (
                    <button
                        onClick={handleCopy}
                        className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
            <div className={`p-4 rounded-xl min-h-[50px] text-sm leading-relaxed whitespace-pre-wrap ${original ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-500' : 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50 text-slate-700 dark:text-slate-200 shadow-inner'}`}>
                {Array.isArray(content) ? content.join(', ') : (content || 'No content generated.')}
            </div>
        </div>
    );
};

const PRESETS = [
    { id: 'bg-remove', label: 'Office Backdrop', prompt: 'Replace with modern office.' },
    { id: 'color-fix', label: 'Studio Lighting', prompt: 'Add studio lighting.' },
    { id: 'attire-fix', label: 'Business Attire', prompt: 'Adjust to business attire.' },
    { id: 'clean-up', label: 'High Fidelity', prompt: 'Enhance image fidelity.' },
];

const InputTypeTab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => {
    const baseClasses = "px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-t-lg border-b-2 transition-colors";
    const activeClasses = "border-primary-500 text-primary-600 dark:text-primary-400";
    const inactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300";

    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};

export const ProfileOptimizer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [inputMode, setInputMode] = useState<'manual' | 'linkedin-url'>('manual');
    const [linkedInUrl, setLinkedInUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const [headline, setHeadline] = useState('');
    const [about, setAbout] = useState('');
    const [aboutInputType, setAboutInputType] = useState<'text' | 'bullets'>('text');
    const [education, setEducation] = useState('');
    const [skills, setSkills] = useState('');
    const [goal, setGoal] = useState('job-seeking');

    const [photoMode, setPhotoMode] = useState<'upload' | 'generate'>('upload');
    const [photoGenPrompt, setPhotoGenPrompt] = useState('');
    const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoEditPrompt, setPhotoEditPrompt] = useState('');
    const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimizedContent, setOptimizedContent] = useState<OptimizedProfile | null>(null);
    const [editedPhoto, setEditedPhoto] = useState<string | null>(null);

    const { addHistoryItem } = useHistory();
    const { checkCredits, deductCredits } = useCredits();

    const handleLinkedInImport = async () => {
        console.log('Import button clicked');
        console.log('URL:', linkedInUrl);

        if (!linkedInUrl.trim()) {
            setError('Please enter a LinkedIn profile URL.');
            return;
        }

        setIsImporting(true);
        setError(null);

        try {
            console.log('Calling extractLinkedInProfile...');
            const result = await extractLinkedInProfile(linkedInUrl);
            console.log('Extraction result:', result);

            if (result.success && result.data) {
                // Populate form fields with extracted data
                setHeadline(result.data.headline || '');
                setAbout(result.data.about || '');
                setEducation(result.data.education || '');
                setSkills(result.data.skills || '');

                // Switch to manual mode to show the populated form
                setInputMode('manual');

                // Clear any errors and show success
                setError(null);

                // Optional: You could add a success toast/notification here
                console.log('✓ Profile imported successfully!');
            } else {
                console.error('Extraction failed:', result.error);
                setError(result.error || 'Failed to import LinkedIn profile. Please ensure the profile is public and try again.');
            }
        } catch (err) {
            console.error('Import error catch:', err);
            setError('An unexpected error occurred while importing the profile. Please check your internet connection and try again.');
        } finally {
            setIsImporting(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const { data, mimeType } = await fileToBase64(file);
            setPhotoPreview(`data:${mimeType};base64,${data}`);
            setEditedPhoto(null);
        }
    };

    const handleGenerateHeadshot = async () => {
        if (!photoGenPrompt.trim()) return;
        setIsGeneratingPhoto(true);
        try {
            const base64 = await generateProfilePhoto(photoGenPrompt);
            setPhotoPreview(`data:image/jpeg;base64,${base64}`);
            setEditedPhoto(null);
        } catch (err) {
            setError('Failed to generate headshot.');
        } finally {
            setIsGeneratingPhoto(false);
        }
    };

    const togglePreset = (id: string) => {
        setSelectedPresets(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!headline.trim() || !about.trim()) {
            setError('Headline and About section are required.');
            return;
        }

        if (!checkCredits(10)) {
            alert("Not enough credits! Please upgrade your plan.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOptimizedContent(null);
        setEditedPhoto(null);

        const success = await deductCredits(10);
        if (!success) {
            setIsLoading(false);
            alert("Failed to process credits. Please try again.");
            return;
        }

        try {
            const promises = [];
            // Promise 1: Text optimization
            promises.push(optimizeLinkedInProfile({ headline, about, education, skills }, goal));

            // Promise 2: (Optional) photo enhancement
            if (photoPreview) {
                const activePresets = PRESETS.filter(p => selectedPresets.includes(p.id)).map(p => p.prompt);
                const finalPrompt = [...activePresets, photoEditPrompt].filter(Boolean).join(' ');
                if (finalPrompt.trim()) {
                    const data = photoPreview.split(',')[1];
                    const mimeType = photoPreview.match(/:(.*?);/)?.[1] || 'image/jpeg';
                    promises.push(editProfilePhoto(data, mimeType, finalPrompt));
                }
            }

            const results = await Promise.all(promises);
            const textResults = results[0] as OptimizedProfile;
            setOptimizedContent(textResults);

            if (results.length > 1) {
                setEditedPhoto(`data:image/jpeg;base64,${results[1]}`);
            }

            addHistoryItem({
                featureType: FeatureName.ProfileOptimizer,
                input: { headline, about, education, skills, goal, aboutInputType },
                output: textResults,
            });
        } catch (err) {
            console.error("Submission error:", err);
            setError('An error occurred during optimization. Please check your data and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [headline, about, education, skills, goal, aboutInputType, photoPreview, photoEditPrompt, selectedPresets, addHistoryItem]);

    const handleExportDoc = () => {
        if (!optimizedContent) return;
        const fullText = `
HEADLINE:
${optimizedContent.headline}

ABOUT:
${optimizedContent.about}

EDUCATION:
${optimizedContent.optimizedEducation}

SKILLS:
${optimizedContent.optimizedSkills}

ELEVATOR PITCH:
${optimizedContent.elevatorPitch}

KEYWORDS:
${optimizedContent.keywords.join(', ')}
        `.trim();
        downloadAsDocx('Optimized-LinkedIn-Profile', fullText);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <BackButton onClick={onBack} />

            {/* Input Mode Selection */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">How would you like to start?</h2>
                    <p className="text-slate-500">Choose your preferred input method</p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => setInputMode('manual')}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all border-2 ${inputMode === 'manual'
                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Manual Input</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setInputMode('linkedin-url')}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all border-2 ${inputMode === 'linkedin-url'
                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            <span>Import from LinkedIn</span>
                        </div>
                    </button>
                </div>

                {/* LinkedIn URL Import Section */}
                {inputMode === 'linkedin-url' && (
                    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                            <div className="flex gap-3">
                                <svg className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="text-sm text-amber-900 dark:text-amber-100">
                                    <p className="font-bold mb-1">⚠️ LinkedIn Restrictions</p>
                                    <p className="text-amber-800 dark:text-amber-200">
                                        LinkedIn restricts automated profile access. If automatic import doesn't work, please use <strong>Manual Input</strong> and copy-paste your profile information directly from LinkedIn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                            <div className="flex gap-3">
                                <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                    <p className="font-bold mb-1">How to get your LinkedIn URL:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                                        <li>Go to your LinkedIn profile</li>
                                        <li>Click "Edit public profile & URL" on the right</li>
                                        <li>Copy your public profile URL (e.g., linkedin.com/in/yourname)</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                LinkedIn Profile URL
                            </label>
                            <Input
                                value={linkedInUrl}
                                onChange={(e) => setLinkedInUrl(e.target.value)}
                                placeholder="linkedin.com/in/yourname or https://linkedin.com/in/yourname"
                                className="h-14 text-base"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                console.log('BUTTON CLICKED!', linkedInUrl);
                                handleLinkedInImport();
                            }}
                            disabled={isImporting || !linkedInUrl.trim()}
                            className="w-full h-14 text-base font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isImporting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Spinner size="sm" className="text-white" />
                                    <span>Importing...</span>
                                </div>
                            ) : 'Import Profile Data'}
                        </button>

                        {error && inputMode === 'linkedin-url' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Form - Only show in manual mode */}
            {inputMode === 'manual' && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Visual Studio UI */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-2xl">
                                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Studio AI Headshot Assistant</h3>
                                    <p className="text-slate-500 font-medium">Transform a selfie or generate a brand new professional image.</p>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-10 items-start">
                                <div className="flex-shrink-0 w-full lg:w-56 space-y-4">
                                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
                                        <button type="button" onClick={() => setPhotoMode('upload')} className={`flex-1 text-[11px] font-black uppercase py-3 rounded-lg transition-all ${photoMode === 'upload' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500'}`}>Upload</button>
                                        <button type="button" onClick={() => setPhotoMode('generate')} className={`flex-1 text-[11px] font-black uppercase py-3 rounded-lg transition-all ${photoMode === 'generate' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500'}`}>Generate</button>
                                    </div>
                                    <div className="aspect-square bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-xl group relative cursor-pointer" onClick={() => photoMode === 'upload' && document.getElementById('photo-input')?.click()}>
                                        {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full p-4"><div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2"><svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={2.5} /></svg></div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Image Selected</span></div>}
                                        <input type="file" id="photo-input" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </div>
                                </div>

                                <div className="flex-grow w-full space-y-8">
                                    {photoMode === 'generate' ? (
                                        <div className="space-y-4">
                                            <Textarea value={photoGenPrompt} onChange={e => setPhotoGenPrompt(e.target.value)} placeholder="e.g., Professional corporate portrait of a woman in a grey blazer, soft blurred background..." rows={3} className="bg-white" />
                                            <Button type="button" onClick={handleGenerateHeadshot} disabled={isGeneratingPhoto} className="w-full h-12">
                                                {isGeneratingPhoto ? <Spinner size="sm" className="text-white" /> : 'Generate AI Headshot'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Quick Studio Enhancements</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {PRESETS.map(p => (
                                                        <button key={p.id} type="button" onClick={() => togglePreset(p.id)} className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${selectedPresets.includes(p.id) ? 'bg-primary-600 text-white border-primary-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'}`}>
                                                            {p.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Refinement Instructions</h4>
                                                <Input value={photoEditPrompt} onChange={e => photoEditPrompt === e.target.value ? null : setPhotoEditPrompt(e.target.value)} placeholder="e.g., Change my tie to navy blue, remove the shadows..." className="bg-white h-14" />
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[9px] font-bold text-slate-400 tracking-[0.1em] uppercase">Powered by Gemini Visual Intelligence</p>
                                </div>
                            </div>
                        </div>

                        {/* Text Optimization Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Headline*</label>
                                <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g., Senior Project Manager at Amazon" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Goal</label>
                                <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full h-[42px] px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm">
                                    <option value="job-seeking">Find a new job (Recruiter Focus)</option>
                                    <option value="personal-brand">Build personal brand (Authority Focus)</option>
                                    <option value="sales">Generate Leads (Client Focus)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Current About Section*</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                                        <InputTypeTab active={aboutInputType === 'text'} onClick={() => setAboutInputType('text')}>Existing Bio</InputTypeTab>
                                        <InputTypeTab active={aboutInputType === 'bullets'} onClick={() => setAboutInputType('bullets')}>Bulleted List</InputTypeTab>
                                    </div>
                                </div>
                                <Textarea
                                    rows={6}
                                    value={about}
                                    onChange={e => setAbout(e.target.value)}
                                    placeholder={aboutInputType === 'bullets' ? "Enter achievements as bullet points:\n- Managed a team of 10 developers\n- Reduced infrastructure costs by 25%\n- Orchestrated the launch of 'Product X'" : "Paste your current profile intro here..."}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Education History</label>
                                <Textarea rows={3} value={education} onChange={e => setEducation(e.target.value)} placeholder="List your degrees, schools, and years..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Core Skills</label>
                                <Textarea rows={3} value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., Python, React, Team Leadership..." />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button type="submit" disabled={isLoading || !headline || !about} className="h-16 px-12 text-lg font-black uppercase tracking-widest shadow-2xl rounded-2xl transform transition-all hover:scale-[1.02] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-3">
                                {isLoading ? <div className="flex items-center gap-3"><Spinner size="sm" className="text-white dark:text-slate-900" /> <span>Building Assets...</span></div> : (
                                    <>
                                        <span>Apply Changes & Optimize</span>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </>
                                )}
                            </Button>
                        </div>
                        {error && <p className="text-center text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
                    </form>
                </div>
            )}

            {optimizedContent && (
                <div className="animate-fade-in space-y-10">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-primary-100">
                        <div className="p-8 bg-primary-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">Optimized Assets</h3>
                                <p className="text-primary-100 text-xs mt-1">LinkedIn Algorithm-Ready Content</p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleExportDoc} variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 px-6">Export .docx</Button>
                                <ActionButtons textToCopy={optimizedContent.about} downloadFilename="optimized-profile" downloadableText={optimizedContent.about} layout="social" />
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <ProfileField label="Optimized Headline" content={optimizedContent.headline} />
                                <ProfileField label="Optimized About" content={optimizedContent.about} />
                                <ProfileField label="Refined Education" content={optimizedContent.optimizedEducation} />
                                <ProfileField label="Strategized Skills" content={optimizedContent.optimizedSkills} />

                                <div className="pt-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">SEO Keyword Cloud</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {optimizedContent.keywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">#{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 flex flex-col">
                                <div className="bg-primary-50 dark:bg-primary-900/10 p-8 rounded-3xl border border-primary-100 dark:border-primary-800 flex-grow relative">
                                    <h4 className="text-[10px] font-black uppercase text-primary-600 mb-3 tracking-[0.2em]">Elevator Pitch</h4>
                                    <p className="text-slate-700 dark:text-slate-300 italic font-serif text-lg leading-relaxed">"{optimizedContent.elevatorPitch}"</p>
                                </div>

                                {editedPhoto && (
                                    <div className="text-center space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">AI Enhanced Studio Output</h4>
                                        <div className="relative inline-block group mx-auto">
                                            <img src={editedPhoto} className="w-80 h-80 object-cover rounded-3xl shadow-2xl border-4 border-white dark:border-slate-800" alt="Optimized Profile" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                                                <Button onClick={() => downloadImage(editedPhoto!, 'enhanced-headshot')} variant="primary" className="flex items-center gap-2 shadow-2xl">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    Download JPG
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => downloadImage(editedPhoto!, 'enhanced-headshot')}
                                                className="text-primary-600 dark:text-primary-400 font-black uppercase text-[10px] tracking-widest hover:underline flex items-center gap-1 mx-auto"
                                            >
                                                Save Enhanced Image
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


import React, { useState, useCallback } from 'react';
import { Button } from './common/Button.tsx';
import { BackButton } from './common/BackButton.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Input } from './common/Input.tsx';
import { Spinner } from './common/Spinner.tsx';
import { optimizeLinkedInProfile, editProfilePhoto, generateProfilePhoto } from '../services/geminiService.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { FeatureName, OptimizedProfile } from '../types.ts';
import { ActionButtons } from './common/ActionButtons.tsx';
import { downloadImage, downloadAsDocx } from '../utils/export.ts';

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

        setIsLoading(true);
        setError(null);
        setOptimizedContent(null);
        setEditedPhoto(null);

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
                        <Button type="submit" disabled={isLoading || !headline || !about} className="h-16 px-12 text-lg font-black uppercase tracking-widest shadow-2xl rounded-2xl transform transition-all hover:scale-[1.02] bg-primary-600 hover:bg-primary-700">
                            {isLoading ? <div className="flex items-center gap-3"><Spinner size="sm" className="text-white" /> <span>Building Assets...</span></div> : 'Apply Changes & Optimize'}
                        </Button>
                    </div>
                    {error && <p className="text-center text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
                </form>
            </div>

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

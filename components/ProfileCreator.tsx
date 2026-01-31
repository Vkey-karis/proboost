
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './common/Button.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
import { generateNewProfile, generateProfilePhoto, generateBannerPhoto, editProfilePhoto } from '../services/geminiService.ts';
import { Select } from './common/Select.tsx';
import { Input } from './common/Input.tsx';
import { useHistory } from '../hooks/useHistory.ts';
import { FeatureName, IndividualProfileInput, CompanyProfileInput, GeneratedIndividualProfile, GeneratedCompanyProfile, ProfileTemplate } from '../types.ts';
import { ResultDisplayCard } from './common/ResultDisplayCard.tsx';
import { downloadImage } from '../utils/export.ts';
import { TemplateSelector } from './common/TemplateSelector.tsx';

const DRAFT_STORAGE_KEY = 'proboost-profile-creator-draft';

const COMMON_JOB_TITLES = [
    "Software Engineer", "Senior Software Engineer", "Product Manager", "Project Manager", 
    "Data Scientist", "Marketing Manager", "UX Designer", "Sales Manager", 
    "Account Manager", "Business Analyst", "Human Resources Manager", "DevOps Engineer", 
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", 
    "Consultant", "Chief Executive Officer (CEO)", "Chief Technology Officer (CTO)", 
    "Operations Manager", "Content Creator", "Digital Marketer", "Social Media Manager", 
    "Product Designer", "Solutions Architect", "Recruiter", "Customer Success Manager", 
    "Executive Assistant", "Financial Analyst", "Graphic Designer", "Marketing Specialist",
    "Creative Director", "Cybersecurity Analyst", "Systems Administrator", "Cloud Architect",
    "Legal Counsel", "Managing Director", "VP of Engineering", "Head of Product"
];

const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
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

const PHOTO_PRESETS = [
    { id: 'bg-office', label: 'Office Backdrop', prompt: 'Replace background with a modern, high-end corporate office.' },
    { id: 'bg-nature', label: 'Outdoor/Park', prompt: 'Replace background with a soft-focus natural park setting.' },
    { id: 'attire-suit', label: 'Business Suit', prompt: 'Adjust attire to a professional business suit.' },
    { id: 'attire-casual', label: 'Smart Casual', prompt: 'Adjust attire to a professional smart-casual blazer.' },
    { id: 'lighting-studio', label: 'Studio Light', prompt: 'Enhance with professional studio portrait lighting.' },
];

const initialIndividualState: IndividualProfileInput = {
    fullName: '', industry: '', role: '', skills: '', achievements: '', bio: '', audience: '', cta: '',
    school: '', degree: '', fieldOfStudy: '', educationDescription: '', template: 'modern'
};

const initialCompanyState: CompanyProfileInput = {
    companyName: '', industry: '', companySize: '1-10 employees', tagline: '', mission: '', services: '', audience: '', culture: '', template: 'modern'
};

interface ProfileCreatorState {
    profileType: 'individual' | 'company';
    individualData: IndividualProfileInput;
    companyData: CompanyProfileInput;
    photoDescription: string;
    bannerDescription: string;
    photoPreview: string | null;
    selectedPhotoPresets: string[];
    generatedAssets: GeneratedIndividualProfile | GeneratedCompanyProfile | null;
    generatedPhoto: string | null;
    generatedBanner: string | null;
}

export const ProfileCreator: React.FC = () => {
    const [profileType, setProfileType] = useState<'individual' | 'company'>('individual');
    const [individualData, setIndividualData] = useState<IndividualProfileInput>(initialIndividualState);
    const [companyData, setCompanyData] = useState<CompanyProfileInput>(initialCompanyState);
    
    const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [photoMode, setPhotoMode] = useState<'upload' | 'generate'>('generate');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoDescription, setPhotoDescription] = useState(''); 
    const [selectedPhotoPresets, setSelectedPhotoPresets] = useState<string[]>([]);
    const [bannerDescription, setBannerDescription] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [generatedAssets, setGeneratedAssets] = useState<GeneratedIndividualProfile | GeneratedCompanyProfile | null>(null);
    const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
    const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);
    const [lastState, setLastState] = useState<ProfileCreatorState | null>(null);
    
    const { addHistoryItem } = useHistory();

    // Load draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
            try {
                const { type, individual, company, photoDesc, bannerDesc, photoMode: savedPhotoMode } = JSON.parse(savedDraft);
                if (type) setProfileType(type);
                if (individual) setIndividualData(individual);
                if (company) setCompanyData(company);
                if (photoDesc) setPhotoDescription(photoDesc);
                if (bannerDesc) setBannerDescription(bannerDesc);
                if (savedPhotoMode) setPhotoMode(savedPhotoMode);
                
                setSaveStatus('Draft Restored');
                setTimeout(() => setSaveStatus(null), 3000);
            } catch (e) {
                console.error("Failed to parse saved draft", e);
            }
        }
    }, []);

    // Auto-save draft logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const draft = {
                type: profileType,
                individual: individualData,
                company: companyData,
                photoDesc: photoDescription,
                bannerDesc: bannerDescription,
                photoMode
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
            setSaveStatus('Auto-saved');
            setTimeout(() => setSaveStatus(null), 1500);
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [profileType, individualData, companyData, photoDescription, bannerDescription, photoMode]);

    // Click outside handler for auto-suggest
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUndo = useCallback(() => {
        if (!lastState) return;
        setProfileType(lastState.profileType);
        setIndividualData(lastState.individualData);
        setCompanyData(lastState.companyData);
        setPhotoDescription(lastState.photoDescription);
        setBannerDescription(lastState.bannerDescription);
        setPhotoPreview(lastState.photoPreview);
        setSelectedPhotoPresets(lastState.selectedPhotoPresets);
        setGeneratedAssets(lastState.generatedAssets);
        setGeneratedPhoto(lastState.generatedPhoto);
        setGeneratedBanner(lastState.generatedBanner);
        setLastState(null);
    }, [lastState]);

    const handleSaveDraft = () => {
        const draft = {
            type: profileType,
            individual: individualData,
            company: companyData,
            photoDesc: photoDescription,
            bannerDesc: bannerDescription,
            photoMode
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setSaveStatus('Draft Saved Locally');
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handleClearDraft = () => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setSaveStatus('Draft Cleared');
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to clear the form? This will also remove your saved draft.')) {
            setIndividualData(initialIndividualState);
            setCompanyData(initialCompanyState);
            setPhotoDescription('');
            setBannerDescription('');
            setPhotoPreview(null);
            setSelectedPhotoPresets([]);
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setSaveStatus('Form Reset');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const { data, mimeType } = await fileToBase64(file);
            setPhotoPreview(`data:${mimeType};base64,${data}`);
            setGeneratedPhoto(null);
        }
    };

    const handleIndividualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setIndividualData(prev => ({ ...prev, [name]: value }));

        if (name === 'role') {
            if (value.trim().length > 0) {
                const filtered = COMMON_JOB_TITLES.filter(title => 
                    title.toLowerCase().includes(value.toLowerCase())
                ).slice(0, 5);
                setRoleSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
            } else {
                setShowSuggestions(false);
            }
        }
    };

    const selectRoleSuggestion = (title: string) => {
        setIndividualData(prev => ({ ...prev, role: title }));
        setShowSuggestions(false);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCompanyData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const setTemplate = (id: ProfileTemplate) => {
      if (profileType === 'individual') {
        setIndividualData(prev => ({ ...prev, template: id }));
      } else {
        setCompanyData(prev => ({ ...prev, template: id }));
      }
    };

    const togglePreset = (id: string) => {
        setSelectedPhotoPresets(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = profileType === 'individual' ? individualData : companyData;
        const requiredFields = profileType === 'individual' 
            ? ['fullName', 'industry', 'role', 'skills', 'achievements']
            : ['companyName', 'industry', 'mission', 'services'];

        if (requiredFields.some(field => !(data as any)[field].trim())) {
             setError(`Please fill in all required fields for the ${profileType} profile.`);
             return;
        }

        // Save state for undo
        setLastState({
            profileType,
            individualData,
            companyData,
            photoDescription,
            bannerDescription,
            photoPreview,
            selectedPhotoPresets,
            generatedAssets,
            generatedPhoto,
            generatedBanner
        });

        setIsLoading(true);
        setError(null);
        setGeneratedAssets(null);
        setGeneratedPhoto(null);
        setGeneratedBanner(null);

        try {
            const promises = [];
            
            // Promise 0: Text Profile
            promises.push(generateNewProfile(profileType, data));

            // Promise 1: Photo Handling
            if (profileType === 'individual') {
                if (photoMode === 'upload' && photoPreview) {
                    const activePresets = PHOTO_PRESETS.filter(p => selectedPhotoPresets.includes(p.id)).map(p => p.prompt);
                    const finalPrompt = [...activePresets, photoDescription].filter(Boolean).join(' ');
                    if (finalPrompt.trim()) {
                        const base64 = photoPreview.split(',')[1];
                        const mime = photoPreview.match(/:(.*?);/)?.[1] || 'image/jpeg';
                        promises.push(editProfilePhoto(base64, mime, finalPrompt));
                    } else {
                        // Just use original
                        promises.push(Promise.resolve(photoPreview.split(',')[1]));
                    }
                } else if (photoMode === 'generate' && photoDescription.trim()) {
                    promises.push(generateProfilePhoto(photoDescription));
                } else {
                    promises.push(Promise.resolve(null));
                }
            } else {
                promises.push(Promise.resolve(null));
            }
            
            // Promise 2: Banner
            if (bannerDescription.trim()) {
                promises.push(generateBannerPhoto(data.industry, bannerDescription));
            } else {
                promises.push(Promise.resolve(null));
            }

            const results = await Promise.all(promises);
            
            const textResults = results[0] as GeneratedIndividualProfile | GeneratedCompanyProfile;
            setGeneratedAssets(textResults);

            if (results[1]) {
                setGeneratedPhoto(`data:image/jpeg;base64,${results[1]}`);
            }
            
            if (results[2]) {
                setGeneratedBanner(`data:image/jpeg;base64,${results[2]}`);
            }

            // Success: clear the draft as the goal is achieved
            localStorage.removeItem(DRAFT_STORAGE_KEY);

            addHistoryItem({
                featureType: FeatureName.ProfileCreator,
                input: { profileType, data },
                output: textResults
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [profileType, individualData, companyData, photoMode, photoPreview, photoDescription, selectedPhotoPresets, bannerDescription, generatedAssets, generatedPhoto, generatedBanner, addHistoryItem]);

    const updateAssetContent = (key: string, newContent: string) => {
        setGeneratedAssets(prev => prev ? { ...prev, [key]: newContent } : null);
    };

    const formIsFilled = () => {
        if (profileType === 'individual') {
            return individualData.fullName && individualData.industry && individualData.role && individualData.skills && individualData.achievements;
        }
        return companyData.companyName && companyData.industry && companyData.mission && companyData.services;
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-20">
            <div className="lg:w-2/5 w-full">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl sticky top-24 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                           <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Profile Forge</h2>
                           {saveStatus && (
                               <span className="text-[9px] font-bold text-primary-500 animate-pulse uppercase tracking-widest">{saveStatus}</span>
                           )}
                        </div>
                        <div className="flex items-center gap-1">
                             {lastState && (
                                <button 
                                    onClick={handleUndo} 
                                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                                    title="Undo last action"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
                                    </svg>
                                </button>
                             )}
                             <button 
                                onClick={handleSaveDraft}
                                className="text-[9px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-2 rounded-lg transition-colors"
                             >
                                Save
                             </button>
                             <button 
                                onClick={handleClearDraft}
                                className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                             >
                                Clear
                             </button>
                        </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-6 flex">
                        <button 
                          onClick={() => setProfileType('individual')}
                          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${profileType === 'individual' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          Individual
                        </button>
                        <button 
                          onClick={() => setProfileType('company')}
                          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${profileType === 'company' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          Company
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <TemplateSelector 
                              label="Visual Template" 
                              selected={profileType === 'individual' ? individualData.template : companyData.template} 
                              onSelect={setTemplate}
                            />
                        </div>

                        {profileType === 'individual' ? (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">Experience & Bio</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input name="fullName" value={individualData.fullName} onChange={handleIndividualChange} placeholder="Full Name*" />
                                        <Input name="industry" value={individualData.industry} onChange={handleIndividualChange} placeholder="Industry*" />
                                    </div>
                                    <div className="relative" ref={suggestionsRef}>
                                        <Input 
                                            name="role" 
                                            value={individualData.role} 
                                            onChange={handleIndividualChange} 
                                            onFocus={() => individualData.role.length > 0 && setShowSuggestions(true)}
                                            placeholder="Current or Target Role*" 
                                        />
                                        {showSuggestions && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                                {roleSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => selectRoleSuggestion(suggestion)}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Textarea name="skills" rows={2} value={individualData.skills} onChange={handleIndividualChange} placeholder="Top Skills (comma separated)*" />
                                    <Textarea name="achievements" rows={4} value={individualData.achievements} onChange={handleIndividualChange} placeholder="Major Career Wins & Achievements*" />
                                </div>
                                
                                <div className="pt-4 space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">AI Visual Studio</h3>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5">
                                        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
                                            <button type="button" onClick={() => setPhotoMode('generate')} className={`flex-1 text-[10px] font-black uppercase py-2.5 rounded-lg transition-all ${photoMode === 'generate' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}>New Headshot</button>
                                            <button type="button" onClick={() => setPhotoMode('upload')} className={`flex-1 text-[10px] font-black uppercase py-2.5 rounded-lg transition-all ${photoMode === 'upload' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}>Enhance Photo</button>
                                        </div>

                                        {photoMode === 'upload' ? (
                                            <div className="space-y-5">
                                                <div 
                                                    className="aspect-square bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner flex flex-col items-center justify-center cursor-pointer group hover:border-primary-400 transition-colors"
                                                    onClick={() => document.getElementById('creator-photo-input')?.click()}
                                                >
                                                    {photoPreview ? (
                                                        <img src={photoPreview} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-6">
                                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 4v16m8-8H4" /></svg>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Portrait</span>
                                                        </div>
                                                    )}
                                                    <input type="file" id="creator-photo-input" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Style Modification</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {PHOTO_PRESETS.map(p => (
                                                            <button 
                                                                key={p.id} 
                                                                type="button" 
                                                                onClick={() => togglePreset(p.id)}
                                                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border ${selectedPhotoPresets.includes(p.id) ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary-400'}`}
                                                            >
                                                                {p.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Headshot Prompt</label>
                                                <Textarea rows={2} value={photoDescription} onChange={(e) => setPhotoDescription(e.target.value)} placeholder="e.g. Modern business portrait, minimal grey suit, bokeh office background..." className="bg-white" />
                                            </div>
                                        )}
                                        
                                        {photoMode === 'upload' && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Fine-tune Edit</label>
                                                <Input value={photoDescription} onChange={(e) => setPhotoDescription(e.target.value)} placeholder="e.g. Change attire to navy blue suit..." className="text-xs bg-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Custom Banner Vision</label>
                                    <Textarea name="bannerDescription" rows={2} value={bannerDescription} onChange={(e) => setBannerDescription(e.target.value)} placeholder="Describe your brand's header: e.g. Abstract geometric shapes, futuristic tech skyline, warm minimalist office..." className="bg-white/50" />
                                </div>
                            </>
                        ) : (
                             <>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">Business Data</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input name="companyName" value={companyData.companyName} onChange={handleCompanyChange} placeholder="Company Name*" />
                                        <Input name="industry" value={companyData.industry} onChange={handleCompanyChange} placeholder="Industry*" />
                                    </div>
                                    <Textarea name="mission" rows={3} value={companyData.mission} onChange={handleCompanyChange} placeholder="Company Mission & Core Values*" />
                                    <Textarea name="services" rows={3} value={companyData.services} onChange={handleCompanyChange} placeholder="Primary Products or Services*" />
                                </div>
                                
                                <div className="pt-4 space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">Visual Branding</h3>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Brand Banner</label>
                                        <Textarea name="bannerDescription" rows={3} value={bannerDescription} onChange={(e) => setBannerDescription(e.target.value)} placeholder="e.g. A high-end abstract design matching our brand palette of deep blues and gold, minimalist and executive..." className="bg-white" />
                                    </div>
                                </div>
                             </>
                        )}

                        <div className="pt-6 sticky bottom-0 bg-white dark:bg-slate-800 pb-4">
                            <Button type="submit" disabled={isLoading || !formIsFilled()} className="w-full justify-center flex items-center gap-2 h-14 text-lg font-black uppercase tracking-widest shadow-2xl transform active:scale-95 transition-all">
                                {isLoading && <Spinner size="sm" className="text-white" />}
                                {isLoading ? 'Building Brand...' : 'Launch Professional Identity'}
                            </Button>
                        </div>

                        {error && <p className="text-sm text-red-500 mt-2 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                    </form>
                </div>
            </div>

            <div className="lg:w-3/5 w-full">
                 {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                        <Spinner size="lg" className="text-primary-600"/>
                        <h3 className="mt-8 text-2xl font-black uppercase tracking-tight">Forging Identity...</h3>
                        <p className="text-slate-500 mt-2 max-w-sm leading-relaxed">Gemini is weaving your career narrative and generating studio-grade visuals based on your professional DNA.</p>
                    </div>
                )}
                {(generatedAssets || generatedPhoto || generatedBanner) && (
                    <div className="space-y-12 animate-fade-in pb-12">
                        <header className="flex items-center gap-4">
                            <div className="w-12 h-1.5 bg-primary-600 rounded-full" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Professional Brand Assets</h2>
                        </header>
                        
                        <div className="space-y-10">
                            {generatedBanner && (
                                <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                                    <div className="p-5 bg-slate-50 dark:bg-slate-900/80 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary-500" />
                                            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500">Custom Profile Header</h3>
                                        </div>
                                        <Button onClick={() => downloadImage(generatedBanner, 'linkedin-ai-banner')} variant="secondary" className="flex items-center gap-2 h-8 px-5 text-[10px] uppercase font-black border-slate-300 dark:border-slate-600">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Save Full Res
                                        </Button>
                                    </div>
                                    <div className="relative group aspect-[3/1] w-full">
                                        <img src={generatedBanner} alt="Generated banner" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <Button onClick={() => downloadImage(generatedBanner, 'linkedin-ai-banner')} variant="primary" className="h-14 px-10 font-black uppercase tracking-[0.2em] shadow-2xl">Download Full Banner</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {generatedPhoto && (
                                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 inline-block w-full max-w-md">
                                    <div className="p-5 bg-slate-50 dark:bg-slate-900/80 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500">AI Studio Portrait</h3>
                                        </div>
                                        <Button onClick={() => downloadImage(generatedPhoto, 'linkedin-ai-headshot')} variant="secondary" className="flex items-center gap-2 h-8 px-5 text-[10px] uppercase font-black border-slate-300 dark:border-slate-600">
                                            Save JPG
                                        </Button>
                                    </div>
                                    <div className="relative group aspect-square">
                                        <img src={generatedPhoto} alt="Generated headshot" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <Button onClick={() => downloadImage(generatedPhoto, 'linkedin-ai-headshot')} variant="primary" className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-2xl">Download High-Res Portrait</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {generatedAssets && (
                            <div className="grid grid-cols-1 gap-8">
                                {Object.entries(generatedAssets).map(([key, value]) => (
                                    <ResultDisplayCard 
                                        key={key} 
                                        title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        content={Array.isArray(value) ? value.join(' | ') : value as string}
                                        onContentChange={(c) => updateAssetContent(key, c)}
                                        actions={{
                                            textToCopy: Array.isArray(value) ? (value as string[]).join(', ') : value as string,
                                            downloadableText: Array.isArray(value) ? (value as string[]).join('\n') : value as string,
                                            downloadFilename: `linkedin-${key.toLowerCase()}`
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {!isLoading && !generatedAssets && !generatedPhoto && !generatedBanner && (
                   <div className="flex flex-col items-center justify-center h-full text-center p-20 bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-full mb-8 shadow-inner ring-4 ring-primary-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your New Brand Awaits</h2>
                        <p className="text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">Once you launch the Brand Forge, your custom visuals and professional profile copy will be generated here for download.</p>
                        <div className="mt-8 flex gap-3">
                            <div className="w-12 h-1 bg-slate-100 rounded-full" />
                            <div className="w-12 h-1 bg-slate-100 rounded-full" />
                            <div className="w-12 h-1 bg-slate-100 rounded-full" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

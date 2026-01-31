
import React, { useState, useCallback } from 'react';
import { Button } from './common/Button.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
// Fix: Import generateJobPost from services and JobPostAssets from types
import { generateJobPost } from '../services/geminiService.ts';
import { FeatureName, JobPostAssets } from '../types.ts';
import { Select } from './common/Select.tsx';
import { Input } from './common/Input.tsx';
import { useHistory } from '../hooks/useHistory.ts';
import { ResultDisplayCard } from './common/ResultDisplayCard.tsx';

interface JobPostState {
    jobTitle: string;
    companyName: string;
    location: string;
    employmentType: string;
    applicationDeadline: string;
    hiringManager: string;
    description: string;
    generatedAssets: JobPostAssets | null;
}

export const JobPostCreator: React.FC = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [employmentType, setEmploymentType] = useState('Full-time');
    const [applicationDeadline, setApplicationDeadline] = useState('');
    const [hiringManager, setHiringManager] = useState('');
    const [description, setDescription] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedAssets, setGeneratedAssets] = useState<JobPostAssets | null>(null);
    const [lastState, setLastState] = useState<JobPostState | null>(null);
    
    const { addHistoryItem } = useHistory();

    const handleUndo = useCallback(() => {
        if (!lastState) return;
        setJobTitle(lastState.jobTitle);
        setCompanyName(lastState.companyName);
        setLocation(lastState.location);
        setEmploymentType(lastState.employmentType);
        setApplicationDeadline(lastState.applicationDeadline);
        setHiringManager(lastState.hiringManager);
        setDescription(lastState.description);
        setGeneratedAssets(lastState.generatedAssets);
        setLastState(null);
    }, [lastState]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobTitle.trim() || !companyName.trim() || !description.trim()) {
            setError('Please fill in Job Title, Company Name, and Description.');
            return;
        }

        // Save state for undo
        setLastState({
            jobTitle,
            companyName,
            location,
            employmentType,
            applicationDeadline,
            hiringManager,
            description,
            generatedAssets
        });

        setIsLoading(true);
        setError(null);
        setGeneratedAssets(null);
        try {
            const results = await generateJobPost(jobTitle, companyName, description, location, employmentType, applicationDeadline, hiringManager);
            setGeneratedAssets(results);
            addHistoryItem({
                featureType: FeatureName.JobPostCreator,
                input: { jobTitle, companyName, description, location, employmentType, applicationDeadline, hiringManager },
                output: results
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [jobTitle, companyName, description, location, employmentType, applicationDeadline, hiringManager, generatedAssets, addHistoryItem]);
    
    const updateAssetContent = (key: keyof JobPostAssets, newContent: string) => {
        setGeneratedAssets(prev => prev ? { ...prev, [key]: newContent } : null);
    };

    const formIsFilled = jobTitle.trim() && companyName.trim() && description.trim();

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Input Form */}
            <div className="lg:w-1/3 w-full">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md sticky top-24 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Create a Job Post</h2>
                        {lastState && (
                            <button 
                                onClick={handleUndo} 
                                className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors"
                                title="Undo last generation"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
                                </svg>
                                Undo
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Provide details about the role, and the AI will craft a professional job description and a LinkedIn announcement.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                                <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" />
                            </div>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., ProBoost Inc." />
                            </div>
                             <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Remote or New York, NY" />
                            </div>
                            <div>
                                <label htmlFor="employmentType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employment Type</label>
                                <Select id="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                    <option>Temporary</option>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="applicationDeadline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Application Deadline <span className="text-slate-400">(Optional)</span></label>
                                <Input id="applicationDeadline" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} placeholder="e.g., August 31st, 2024" />
                            </div>
                            <div>
                                <label htmlFor="hiringManager" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address To <span className="text-slate-400">(Optional)</span></label>
                                <Input id="hiringManager" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} placeholder="e.g., The Hiring Manager" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Description / Responsibilities</label>
                            <Textarea
                                id="description"
                                rows={8}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="List the key responsibilities, qualifications, and any other relevant details about the role."
                            />
                        </div>

                        <Button type="submit" disabled={isLoading || !formIsFilled} className="w-full justify-center flex items-center gap-2">
                            {isLoading && <Spinner size="sm" />}
                            {isLoading ? 'Generating...' : 'Generate Job Post'}
                        </Button>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="lg:w-2/3 w-full">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <Spinner size="lg"/>
                        <p className="mt-4 text-lg font-semibold">Generating hiring materials...</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">The AI is creating a job description and LinkedIn post to attract top talent.</p>
                    </div>
                )}
                {generatedAssets && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Generated Content</h2>
                        <ResultDisplayCard 
                            title="Full Job Description" 
                            content={generatedAssets.jobDescription}
                            onContentChange={(c) => updateAssetContent('jobDescription', c)}
                            actions={{
                                textToCopy: generatedAssets.jobDescription,
                                downloadableText: generatedAssets.jobDescription,
                                downloadFilename: `job-description-${jobTitle.toLowerCase().replace(/\s/g, '-')}`
                            }}
                        />
                        <ResultDisplayCard 
                            title="LinkedIn Announcement Post" 
                            content={generatedAssets.linkedInPost}
                            onContentChange={(c) => updateAssetContent('linkedInPost', c)}
                            actions={{
                                textToCopy: generatedAssets.linkedInPost,
                                downloadableText: generatedAssets.linkedInPost,
                                downloadFilename: `linkedin-post-${jobTitle.toLowerCase().replace(/\s/g, '-')}`,
                                shareableTitle: `We're hiring a ${jobTitle} at ${companyName}!`,
                                shareableText: generatedAssets.linkedInPost
                            }}
                        />
                    </div>
                )}
                {!isLoading && !generatedAssets && (
                   <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Your job post will appear here</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Fill out the form to generate your hiring content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

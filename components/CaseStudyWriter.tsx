
import React, { useState, useCallback } from 'react';
import { Button } from './common/Button.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
// Fix: Import generateCaseStudy from services and CaseStudyAssets from types
import { generateCaseStudy } from '../services/geminiService.ts';
import { FeatureName, CaseStudyAssets } from '../types.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { ResultDisplayCard } from './common/ResultDisplayCard.tsx';

interface CaseStudyState {
    problem: string;
    solution: string;
    result: string;
    generatedAssets: CaseStudyAssets | null;
}

export const CaseStudyWriter: React.FC = () => {
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedAssets, setGeneratedAssets] = useState<CaseStudyAssets | null>(null);
    const [lastState, setLastState] = useState<CaseStudyState | null>(null);
    
    const { addHistoryItem } = useHistory();

    const handleUndo = useCallback(() => {
        if (!lastState) return;
        setProblem(lastState.problem);
        setSolution(lastState.solution);
        setResult(lastState.result);
        setGeneratedAssets(lastState.generatedAssets);
        setLastState(null);
    }, [lastState]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!problem.trim() || !solution.trim() || !result.trim()) {
            setError('Please fill in all three fields: Problem, Solution, and Result.');
            return;
        }

        // Save state for undo
        setLastState({
            problem,
            solution,
            result,
            generatedAssets
        });

        setIsLoading(true);
        setError(null);
        setGeneratedAssets(null);
        try {
            const results = await generateCaseStudy(problem, solution, result);
            setGeneratedAssets(results);
            addHistoryItem({
                featureType: FeatureName.CaseStudyWriter,
                input: { problem, solution, result },
                output: results,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [problem, solution, result, generatedAssets, addHistoryItem]);

    const updateAssetContent = (key: keyof CaseStudyAssets, newContent: string) => {
        setGeneratedAssets(prev => prev ? { ...prev, [key]: newContent } : null);
    };

    const formIsFilled = problem.trim() && solution.trim() && result.trim();

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Input Form */}
            <div className="lg:w-1/3 w-full">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md sticky top-24 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Create a Case Study</h2>
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
                        Provide the core components of your success story, and the AI will weave them into a professional narrative.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="problem" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">The Problem</label>
                            <Textarea
                                id="problem"
                                rows={4}
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                placeholder="What was the client's challenge or pain point?"
                            />
                        </div>
                        <div>
                            <label htmlFor="solution" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">The Solution</label>
                            <Textarea
                                id="solution"
                                rows={4}
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder="How did you or your product solve this problem?"
                            />
                        </div>
                        <div>
                            <label htmlFor="result" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">The Result</label>
                            <Textarea
                                id="result"
                                rows={4}
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                placeholder="What were the measurable outcomes? (e.g., increased revenue by 30%, saved 50 hours/month)."
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !formIsFilled} className="w-full justify-center flex items-center gap-2">
                            {isLoading && <Spinner size="sm" />}
                            {isLoading ? 'Generating...' : 'Generate Case Study'}
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
                        <p className="mt-4 text-lg font-semibold">Crafting your success story...</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">The AI is building a compelling narrative from your inputs.</p>
                    </div>
                )}
                {generatedAssets && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Generated Content</h2>
                        <ResultDisplayCard 
                            title="Full Case Study" 
                            content={generatedAssets.caseStudy}
                            onContentChange={(c) => updateAssetContent('caseStudy', c)}
                            actions={{
                                textToCopy: generatedAssets.caseStudy,
                                downloadableText: generatedAssets.caseStudy,
                                downloadFilename: 'case-study'
                            }}
                        />
                        <ResultDisplayCard 
                            title="LinkedIn Story Teaser" 
                            content={generatedAssets.storyTeaser}
                            onContentChange={(c) => updateAssetContent('storyTeaser', c)}
                            actions={{
                                textToCopy: generatedAssets.storyTeaser,
                                downloadableText: generatedAssets.storyTeaser,
                                downloadFilename: 'linkedin-story-teaser',
                                shareableTitle: 'Check out this case study!',
                                shareableText: generatedAssets.storyTeaser
                            }}
                        />
                    </div>
                )}
                {!isLoading && !generatedAssets && (
                   <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Your case study will appear here</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Fill out the form to generate your success story.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

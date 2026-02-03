
import React, { useState, useCallback } from 'react';
import { Button } from './common/Button.tsx';
import { BackButton } from './common/BackButton.tsx';
import { Select } from './common/Select.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Spinner } from './common/Spinner.tsx';
import { ResultCard } from './ResultCard.tsx';
import { generateLinkedInPosts } from '../services/geminiService.ts';
import { PERSONAS } from '../constants.tsx';
import { Persona, InputType, GeneratedContent, FeatureName, PostDraft } from '../types.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { downloadPostsAsZip } from '../utils/export.ts';
import { useCredits } from '../hooks/useCredits.ts';

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

const TONES = [
  'Professional',
  'Casual',
  'Informative',
  'Provocative',
  'Humorous',
  'Enthusiastic',
  'Thought-provoking',
  'Direct'
];

interface ContentGenState {
  inputType: InputType;
  persona: Persona;
  tone: string;
  inputText: string;
  wordCount: number;
  generatedContent: GeneratedContent | null;
}

export const ContentGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [inputType, setInputType] = useState<InputType>('prompt');
  const [persona, setPersona] = useState<Persona>(PERSONAS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [inputText, setInputText] = useState('');
  const [wordCount, setWordCount] = useState(150);
  const [isLoading, setIsLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [lastState, setLastState] = useState<ContentGenState | null>(null);

  const { addHistoryItem } = useHistory();
  const { checkCredits, deductCredits } = useCredits();

  const handleUndo = useCallback(() => {
    if (!lastState) return;
    setInputType(lastState.inputType);
    setPersona(lastState.persona);
    setTone(lastState.tone);
    setInputText(lastState.inputText);
    setWordCount(lastState.wordCount);
    setGeneratedContent(lastState.generatedContent);
    setLastState(null);
  }, [lastState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please enter some text to generate content.');
      return;
    }

    // Save current state for undo
    setLastState({
      inputType,
      persona,
      tone,
      inputText,
      wordCount,
      generatedContent
    });

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    if (!checkCredits(3)) { // Check before doing anything, although user should be prompted
      alert("Not enough credits! Please upgrade your plan.");
      setIsLoading(false);
      return;
    }

    const success = await deductCredits(3);
    if (!success) {
      setIsLoading(false);
      alert("Failed to process credits. Please try again.");
      return;
    }

    try {
      const results = await generateLinkedInPosts(inputType, inputText, persona, wordCount, tone);
      setGeneratedContent(results);
      addHistoryItem({
        featureType: FeatureName.ContentGenerator,
        input: { inputType, inputText, persona, wordCount, tone },
        output: results,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputType, inputText, persona, wordCount, tone, generatedContent, addHistoryItem, checkCredits, deductCredits]);

  const handleExportAll = async () => {
    if (!generatedContent) return;
    setIsZipping(true);
    try {
      await downloadPostsAsZip(generatedContent);
    } finally {
      setIsZipping(false);
    }
  };

  const updateDraft = (index: number, updatedDraft: PostDraft) => {
    if (!generatedContent) return;
    const newContent = [...generatedContent];
    newContent[index] = updatedDraft;
    setGeneratedContent(newContent);
  };

  const placeholderText = {
    paste: 'Paste your blog post, newsletter, or article text here...',
    bullets: 'Enter your meeting highlights or bullet points...\n- Launched new feature with a 15% user increase\n- Onboarded three enterprise clients\n- Spoke at the a web dev conference',
    prompt: 'Describe your idea for a post. For example: "Write a post about the importance of mentorship for junior developers."',
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <BackButton onClick={onBack} />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Input Form */}
        <div className="lg:w-1/3 w-full">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create LinkedIn Posts</h2>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Input Type</label>
                <div className="border-b border-slate-200 dark:border-slate-700">
                  <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <InputTypeTab active={inputType === 'prompt'} onClick={() => setInputType('prompt')}>Prompt</InputTypeTab>
                    <InputTypeTab active={inputType === 'bullets'} onClick={() => setInputType('bullets')}>Bullets</InputTypeTab>
                    <InputTypeTab active={inputType === 'paste'} onClick={() => setInputType('paste')}>Paste Text</InputTypeTab>
                  </nav>
                </div>
              </div>

              <div>
                <label htmlFor="inputText" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <Textarea
                  id="inputText"
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={placeholderText[inputType]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="persona" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Persona</label>
                  <Select id="persona" value={persona} onChange={(e) => setPersona(e.target.value as Persona)}>
                    {PERSONAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                </div>
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Desired Tone</label>
                  <Select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="wordCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Approximate Word Count ({wordCount} words)
                </label>
                <input
                  id="wordCount"
                  type="range"
                  min="50"
                  max="1200"
                  step="50"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary-600"
                />
              </div>

              <Button type="submit" disabled={isLoading || !inputText.trim()} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                {isLoading && <Spinner size="sm" className="text-white dark:text-slate-900" />}
                {isLoading ? 'Generating...' : 'Generate Posts'}
              </Button>

              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:w-2/3 w-full">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <Spinner size="lg" />
              <p className="mt-4 text-lg font-semibold">Generating your content...</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">The AI is crafting 3 unique posts in a {tone.toLowerCase()} tone. This might take a moment.</p>
            </div>
          )}
          {generatedContent && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Generated Drafts</h2>
                <Button
                  variant="secondary"
                  onClick={handleExportAll}
                  disabled={isZipping}
                  className="flex items-center gap-2"
                >
                  {isZipping ? <Spinner size="sm" /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  Export All (ZIP)
                </Button>
              </div>
              {generatedContent.map((draft, index) => (
                <ResultCard key={index} draft={draft} onUpdate={(updated) => updateDraft(index, updated)} />
              ))}
            </div>
          )}
          {!isLoading && !generatedContent && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-slate-300 dark:border-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Your content will appear here</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Fill out the form and choose your preferred tone to generate your LinkedIn posts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

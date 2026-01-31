
import React, { useState } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { Spinner } from './common/Spinner.tsx';
import { generateTrendingPosts } from '../services/geminiService.ts';
import { ResultCard } from './ResultCard.tsx';
import { Persona, TrendingPostResult, FeatureName } from '../types.ts';
import { PERSONAS } from '../constants.tsx';
import { Select } from './common/Select.tsx';
import { useHistory } from '../hooks/useHistory.ts';

export const NewsToPost: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState<Persona>(PERSONAS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrendingPostResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { addHistoryItem } = useHistory();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateTrendingPosts(topic, persona);
      setResult(data);
      addHistoryItem({
        featureType: FeatureName.NewsToPost,
        input: { topic, persona },
        output: data
      });
    } catch (err) {
      setError("Failed to fetch news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const posts = result?.posts || [];
  const sources = result?.sources || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
             <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">News-to-Viral Content</h2>
            <p className="text-slate-500">We search Google for the latest trends so you don't have to.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              placeholder="Enter a topic (e.g. 'OpenAI latest model', 'Bitcoin regulation', 'Remote work trends')..." 
              className="h-12 text-lg"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={persona} onChange={e => setPersona(e.target.value as Persona)} className="h-12">
              {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <Button type="submit" disabled={isLoading} className="h-12 px-8">
            {isLoading ? <Spinner size="sm" /> : 'Search & Draft'}
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-pulse">
           <Spinner size="lg" className="mx-auto mb-4" />
           <p className="text-xl font-bold">Scanning Global News Sources...</p>
           <p className="text-slate-500">Gemini is finding specific, direct article links for you.</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold">Generated Viral Drafts</h3>
            {posts.map((post, i) => (
              <ResultCard key={i} draft={post} />
            ))}
            {posts.length === 0 && <p className="p-8 text-center text-slate-400">No posts generated for this topic.</p>}
          </div>
          <div className="space-y-6">
            <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Verified Article Links</h3>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Links verified by Search Grounding"></span>
              </div>
              <div className="space-y-4">
                {sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-sm"
                  >
                    <p className="text-xs font-bold group-hover:text-blue-600 line-clamp-2 leading-relaxed">{source.title}</p>
                    <p className="text-[10px] text-slate-400 mt-2 truncate flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth={2}/></svg>
                      {source.uri ? new URL(source.uri).hostname : 'Source'}
                    </p>
                  </a>
                ))}
                {sources.length === 0 && <p className="text-xs text-slate-400 italic">No grounding sources available.</p>}
              </div>
              <p className="text-[10px] text-slate-400 mt-6 italic">Gemini has prioritized specific article deep-links for these results.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

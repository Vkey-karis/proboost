
import React, { useState } from 'react';
import { HistoryItem, FeatureName, PostDraft, TrendingPostResult } from '../../types.ts';
import { Button } from '../common/Button.tsx';
import { ResultCard } from '../ResultCard.tsx';
import { ActionButtons } from '../common/ActionButtons.tsx';
import { ResultDisplayCard } from '../common/ResultDisplayCard.tsx';

const ProfileField: React.FC<{ label: string; content: string | string[]; original?: boolean }> = ({ label, content, original = false }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        const text = Array.isArray(content) ? content.join(', ') : content;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div>
          <div className="flex justify-between items-end mb-1">
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</h4>
            {!original && content && (
              <button 
                onClick={handleCopy}
                className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Field'}
              </button>
            )}
          </div>
          <div className={`p-3 rounded-md min-h-[60px] text-sm whitespace-pre-wrap ${original ? 'bg-slate-100 dark:bg-slate-900/50' : 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800'}`}>
              {Array.isArray(content) ? content.join(', ') : (content || '...')}
          </div>
      </div>
    );
};

const ContentGeneratorView: React.FC<{ output: PostDraft[] }> = ({ output }) => (
    <div className="space-y-6">
        {output.map((draft, index) => (
            <ResultCard key={index} draft={draft} />
        ))}
    </div>
);

const NewsToPostView: React.FC<{ output: TrendingPostResult }> = ({ output }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold">Generated Viral Drafts</h3>
            {output.posts.map((post, i) => (
              <ResultCard key={i} draft={post} />
            ))}
        </div>
        <div className="space-y-6">
            <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Grounding Sources</h3>
                <div className="space-y-4">
                    {output.sources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="block group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all">
                        <p className="text-xs font-bold group-hover:text-blue-600 line-clamp-1">{source.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{source.uri}</p>
                    </a>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const NetworkingAssistantView: React.FC<{ output: { connectionRequest: string, followUp: string } }> = ({ output }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center justify-between">
              Connection Request
              <ActionButtons textToCopy={output.connectionRequest} downloadableText={output.connectionRequest} downloadFilename="connection-request" />
            </h3>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm italic text-sm text-slate-700 dark:text-slate-300 border-l-4 border-blue-500">
               "{output.connectionRequest}"
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center justify-between">
              Follow-up Message
              <ActionButtons textToCopy={output.followUp} downloadableText={output.followUp} downloadFilename="follow-up" />
            </h3>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
               {output.followUp}
            </div>
          </div>
    </div>
);

const ProfileOptimizerView: React.FC<{ input: any; output: any }> = ({ input, output }) => {
    const getFullOptimizedText = () => {
        if (!output) return '';
        return `Headline: ${output.headline}\n\nAbout: ${output.about}\n\nPitch: ${output.elevatorPitch}`;
    };

    return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <h3 className="font-bold text-lg mb-2">Original Version</h3>
            <div className="space-y-4">
               <ProfileField label="Original Headline" content={input.headline} original/>
               <ProfileField label="Original About" content={input.about} original/>
               {input.education && <ProfileField label="Original Education" content={input.education} original />}
               {input.skills && <ProfileField label="Original Skills" content={input.skills} original />}
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                    Optimized Version
                </h3>
                 <ActionButtons 
                    textToCopy={getFullOptimizedText()}
                    downloadableText={getFullOptimizedText()}
                    downloadFilename="optimized-linkedin-profile"
                    shareableTitle="My Elevator Pitch"
                    shareableText={output.elevatorPitch}
                    layout="social"
                />
            </div>
            <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                <ProfileField label="Optimized Headline" content={output.headline} />
                <ProfileField label="Optimized About" content={output.about} />
                {output.optimizedEducation && <ProfileField label="Optimized Education" content={output.optimizedEducation} />}
                {output.optimizedSkills && <ProfileField label="Optimized Skills" content={output.optimizedSkills} />}
                {output.keywords && <ProfileField label="Targeted Keywords" content={output.keywords} />}
                <ProfileField label="Elevator Pitch" content={output.elevatorPitch} />
            </div>
        </div>
    </div>
    );
};

const DefaultResultView: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const { output, featureType, input } = item;
    const titleCase = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

    const isSocialFeature = featureType === FeatureName.JobApplication;

    const getActions = (key: string, content: string | string[]) => {
        const textContent = Array.isArray(content) ? content.join(', ') : content;
        const downloadable = Array.isArray(content) ? content.join('\n') : content;
        
        let actions = {
            textToCopy: textContent,
            downloadableText: downloadable,
            downloadFilename: key.toLowerCase(),
            shareableTitle: undefined,
            shareableText: undefined,
        };

        if (featureType === FeatureName.CaseStudyWriter) {
            if (key === 'caseStudy') {
                 actions.downloadFilename = 'case-study';
            } else if (key === 'storyTeaser') {
                actions.downloadFilename = 'linkedin-story-teaser';
                actions.shareableTitle = 'Check out this case study!';
                actions.shareableText = textContent;
            }
        } else if (featureType === FeatureName.JobPostCreator) {
            const jobTitle = input.jobTitle || 'job';
            if (key === 'jobDescription') {
                actions.downloadFilename = `job-description-${jobTitle.toLowerCase().replace(/\s/g, '-')}`;
            } else if (key === 'linkedInPost') {
                actions.downloadFilename = `linkedin-post-${jobTitle.toLowerCase().replace(/\s/g, '-')}`;
                actions.shareableTitle = `We're hiring: ${input.jobTitle}`;
                actions.shareableText = textContent;
            }
        } else if (featureType === FeatureName.JobApplication) {
             actions.downloadFilename = key === 'coverLetter' ? 'cover-letter' : 'resume';
             actions.shareableText = textContent;
        } else if (featureType === FeatureName.ProfileCreator) {
            actions.downloadFilename = `linkedin-${key.toLowerCase().replace(/section|title/i, '').trim().replace(/\s+/g, '-')}`;
            if (key === 'headline' || key === 'tagline') {
                actions.shareableTitle = `My new LinkedIn ${key}`;
                actions.shareableText = textContent;
            }
        }
        
        return actions;
    };

    return (
        <div className="space-y-6">
            {Object.entries(output).map(([key, value]) => (
                <ResultDisplayCard 
                    key={key} 
                    title={titleCase(key)} 
                    content={Array.isArray(value) ? value.join(' | ') : value as string}
                    actions={getActions(key, value as string | string[])}
                    layout={isSocialFeature ? 'social' : 'generic'}
                />
            ))}
        </div>
    );
};


interface HistoryResultDetailProps {
  item: HistoryItem;
  onBack: () => void;
}

export const HistoryResultDetail: React.FC<HistoryResultDetailProps> = ({ item, onBack }) => {

    const renderContent = () => {
        switch (item.featureType) {
            case FeatureName.ContentGenerator:
                return <ContentGeneratorView output={item.output} />;
            case FeatureName.NewsToPost:
                return <NewsToPostView output={item.output} />;
            case FeatureName.NetworkingAssistant:
                return <NetworkingAssistantView output={item.output} />;
            case FeatureName.ProfileOptimizer:
                return <ProfileOptimizerView input={item.input} output={item.output} />;
            case FeatureName.JobApplication:
            case FeatureName.CaseStudyWriter:
            case FeatureName.JobPostCreator:
            case FeatureName.ProfileCreator:
                return <DefaultResultView item={item} />;
            default:
                return <p>Cannot display this history item type.</p>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <Button onClick={onBack} variant="secondary" className="flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to History
                </Button>
            </div>
            <h2 className="text-2xl font-bold mb-4">
                Viewing History Item from {new Date(item.timestamp).toLocaleString()}
            </h2>
            {renderContent()}
        </div>
    );
};


import React from 'react';
import { HistoryItem, FeatureName, PostDraft, TrendingPostResult, InterviewPrepAssets } from '../types.ts';
import { Button } from './common/Button.tsx';
import { ResultCard } from './ResultCard.tsx';
import { ActionButtons } from './common/ActionButtons.tsx';
import { ResultDisplayCard } from './common/ResultDisplayCard.tsx';

const ProfileField: React.FC<{ label: string; content: string | string[]; original?: boolean }> = ({ label, content, original = false }) => {
    const text = Array.isArray(content) ? content.join(', ') : (content || '');
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        alert('Field copied!');
    };

    return (
      <div>
          <div className="flex justify-between items-end mb-1">
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</h4>
            {!original && text && (
              <button 
                onClick={handleCopy}
                className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors"
              >
                Copy Field
              </button>
            )}
          </div>
          <div className={`p-3 rounded-md min-h-[60px] text-sm whitespace-pre-wrap ${original ? 'bg-slate-100 dark:bg-slate-900/50' : 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800'}`}>
              {text || '...'}
          </div>
      </div>
    );
};

const ContentGeneratorView: React.FC<{ output: PostDraft[] }> = ({ output }) => {
    const list = Array.isArray(output) ? output : [];
    return (
        <div className="space-y-6">
            {list.map((draft, index) => (
                <ResultCard key={index} draft={draft} />
            ))}
        </div>
    );
};

const NewsToPostView: React.FC<{ output: TrendingPostResult }> = ({ output }) => {
    const posts = output?.posts || [];
    const sources = output?.sources || [];
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold">Generated Viral Drafts</h3>
                {posts.map((post, i) => (
                  <ResultCard key={i} draft={post} />
                ))}
            </div>
            <div className="space-y-6">
                <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Grounding Sources</h3>
                    <div className="space-y-4">
                        {sources.map((source, i) => (
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
};

const NetworkingAssistantView: React.FC<{ output: { connectionRequest: string, followUp: string } }> = ({ output }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center justify-between">
              Connection Request
              <ActionButtons textToCopy={output?.connectionRequest || ''} downloadableText={output?.connectionRequest || ''} downloadFilename="connection-request" layout="social" />
            </h3>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm italic text-sm text-slate-700 dark:text-slate-300 border-l-4 border-blue-500">
               "{output?.connectionRequest || ''}"
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center justify-between">
              Follow-up Message
              <ActionButtons textToCopy={output?.followUp || ''} downloadableText={output?.followUp || ''} downloadFilename="follow-up" layout="social" />
            </h3>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
               {output?.followUp || ''}
            </div>
          </div>
    </div>
);

const ProfileOptimizerView: React.FC<{ input: any; output: any }> = ({ input, output }) => {
    if (!output) return <p>No optimization data available.</p>;
    
    const getFullOptimizedText = () => {
        return `Headline: ${output.headline || ''}\n\nAbout: ${output.about || ''}\n\nPitch: ${output.elevatorPitch || ''}`;
    };

    return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <h3 className="font-bold text-lg mb-2">Original Version</h3>
            <div className="space-y-4">
               <ProfileField label="Original Headline" content={input?.headline || ''} original/>
               <ProfileField label="Original About" content={input?.about || ''} original/>
               {input?.education && <ProfileField label="Original Education" content={input.education} original />}
               {input?.skills && <ProfileField label="Original Skills" content={input.skills} original />}
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
                    shareableText={output.elevatorPitch || ''}
                    layout="social"
                />
            </div>
            <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                <ProfileField label="Optimized Headline" content={output.headline || ''} />
                <ProfileField label="Optimized About" content={output.about || ''} />
                {output.optimizedEducation && <ProfileField label="Optimized Education" content={output.optimizedEducation} />}
                {output.optimizedSkills && <ProfileField label="Optimized Skills" content={output.optimizedSkills} />}
                {output.keywords && <ProfileField label="Targeted Keywords" content={output.keywords} />}
                <ProfileField label="Elevator Pitch" content={output.elevatorPitch || ''} />
            </div>
        </div>
    </div>
    );
};

const InterviewPrepView: React.FC<{ output: InterviewPrepAssets }> = ({ output }) => {
    const questions = output?.questions || [];
    return (
        <div className="space-y-12">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-visible">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white">Strategic Strategy</h3>
                    <ActionButtons 
                        textToCopy={output?.strategicGuide || ''} 
                        downloadableText={output?.strategicGuide || ''} 
                        downloadFilename="interview-strategy" 
                        layout="social"
                    />
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-primary-500 pl-4">"{output?.strategicGuide || 'Strategy not found.'}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {questions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 overflow-visible">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-slate-900 dark:text-white pr-4">{q.question || 'Missing Question'}</h4>
                            <ActionButtons 
                                textToCopy={`Question: ${q.question}\n\nAnswer: ${q.howToAnswer}`} 
                                downloadableText={q.howToAnswer} 
                                downloadFilename={`interview-question-${i+1}`} 
                                layout="social"
                                shareableTitle={`Interview Prep Question ${i+1}`}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Intent</p>
                        <p className="text-xs text-slate-500 mb-4">{q.whyTheyAsk || 'No context provided.'}</p>
                        <p className="text-[10px] text-primary-500 uppercase font-black mb-1">Answer Script</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{q.howToAnswer || 'No script provided.'}</p>
                    </div>
                ))}
            </div>
            <div className="bg-primary-600 text-white p-8 rounded-3xl">
                 <h3 className="text-xs font-black uppercase mb-4 opacity-80">Grounding Insights</h3>
                 <p className="text-sm font-medium leading-relaxed">{output?.companyInsights || 'No extra insights found.'}</p>
            </div>
        </div>
    );
};

const SavedJobView: React.FC<{ job: any }> = ({ job }) => (
    <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
             <svg className="h-40 w-40" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        </div>
        <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                <div className="space-y-1">
                    <h4 className="font-black text-3xl text-slate-900 dark:text-white leading-tight">{job.title}</h4>
                    <p className="text-lg font-bold text-primary-600 uppercase tracking-widest">{job.company} • {job.location}</p>
                </div>
                {job.salaryEstimate && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-2 rounded-full text-sm font-black uppercase tracking-[0.2em]">
                        {job.salaryEstimate}
                    </span>
                )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 mb-10">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Role Snapshot</h5>
                <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed italic font-serif">"{job.snippet}"</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
                <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest bg-primary-600 text-white px-8 py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                >
                    Apply Now
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
                <ActionButtons 
                    textToCopy={`Job Listing: ${job.title} at ${job.company}\nURL: ${job.url}\n\nSummary: ${job.snippet}`}
                    downloadableText={`JOB LISTING\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salaryEstimate || 'N/A'}\nURL: ${job.url}\n\nSummary:\n${job.snippet}`}
                    downloadFilename={`saved-job-${job.title.toLowerCase().replace(/\s+/g, '-')}`}
                    layout="social"
                />
            </div>
        </div>
    </div>
);

const DefaultResultView: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const { output, featureType, input } = item;
    if (!output) return <p className="p-8 text-center text-slate-400">No output data found for this project.</p>;

    const titleCase = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    
    // Expand social layout to more features in history detail
    const isSocialFeature = [
        FeatureName.JobApplication,
        FeatureName.CaseStudyWriter,
        FeatureName.JobPostCreator,
        FeatureName.ProfileCreator,
        FeatureName.NetworkingAssistant
    ].includes(featureType);

    const getActions = (key: string, value: string | string[]) => {
        const textContent = Array.isArray(value) ? value.join(', ') : (value || '');
        const downloadable = Array.isArray(value) ? value.join('\n') : (value || '');
        
        let actions = {
            textToCopy: textContent,
            downloadableText: downloadable,
            downloadFilename: key.toLowerCase(),
            shareableTitle: undefined,
            shareableText: textContent,
        };

        if (featureType === FeatureName.CaseStudyWriter) {
            if (key === 'caseStudy') {
                 actions.downloadFilename = 'case-study';
                 actions.shareableTitle = 'Read my success case study!';
            } else if (key === 'storyTeaser') {
                actions.downloadFilename = 'linkedin-story-teaser';
                actions.shareableTitle = 'Check out this win!';
            }
        } else if (featureType === FeatureName.JobPostCreator) {
            const jobTitle = input?.jobTitle || 'job';
            if (key === 'jobDescription') {
                actions.downloadFilename = `job-description-${jobTitle.toLowerCase().replace(/\s/g, '-')}`;
            } else if (key === 'linkedInPost') {
                actions.downloadFilename = `linkedin-post-${jobTitle.toLowerCase().replace(/\s/g, '-')}`;
                actions.shareableTitle = `We're hiring: ${input.jobTitle}`;
            }
        } else if (featureType === FeatureName.JobApplication) {
             actions.downloadFilename = key === 'coverLetter' ? 'cover-letter' : 'resume';
        } else if (featureType === FeatureName.ProfileCreator) {
            actions.downloadFilename = `linkedin-${key.toLowerCase().replace(/section|title/i, '').trim().replace(/\s+/g, '-')}`;
            if (key === 'headline' || key === 'tagline') {
                actions.shareableTitle = `My new LinkedIn ${key}`;
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
                    content={Array.isArray(value) ? value.join(' | ') : (value as string || '')}
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
        if (!item || !item.output) return <p>Data missing for this entry.</p>;
        
        switch (item.featureType) {
            case FeatureName.ContentGenerator:
                return <ContentGeneratorView output={item.output} />;
            case FeatureName.NewsToPost:
                return <NewsToPostView output={item.output} />;
            case FeatureName.NetworkingAssistant:
                return <NetworkingAssistantView output={item.output} />;
            case FeatureName.ProfileOptimizer:
                return <ProfileOptimizerView input={item.input} output={item.output} />;
            case FeatureName.InterviewPrep:
                return <InterviewPrepView output={item.output} />;
            case FeatureName.SavedJob:
                return <SavedJobView job={item.output} />;
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
            <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-1.5 bg-primary-600 rounded-full" />
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                    Project: {item?.title || 'Untitled'}
                 </h2>
            </div>
            {renderContent()}
        </div>
    );
};

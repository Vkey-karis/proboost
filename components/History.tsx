
import React, { useState, useMemo } from 'react';
import { useHistory } from '../hooks/useHistory.ts';
import { HistoryItem, FeatureName } from '../types.ts';
import { Button } from './common/Button.tsx';
import { Spinner } from './common/Spinner.tsx';
import { HistoryResultDetail } from './HistoryResultDetail.tsx';
import { Input } from './common/Input.tsx';

// Fix: Added missing FeatureName entries to satisfy Record<FeatureName, ...> type.
const FEATURE_META: Record<FeatureName, { title: string; color: string; icon: React.ReactNode }> = {
    [FeatureName.ContentGenerator]: { title: 'Content', color: 'bg-purple-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    [FeatureName.ProfileOptimizer]: { title: 'Branding', color: 'bg-blue-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    [FeatureName.ProfileCreator]: { title: 'Branding', color: 'bg-indigo-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
    [FeatureName.JobApplication]: { title: 'Career', color: 'bg-emerald-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    [FeatureName.CaseStudyWriter]: { title: 'Content', color: 'bg-pink-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    [FeatureName.JobPostCreator]: { title: 'Career', color: 'bg-orange-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    [FeatureName.NewsToPost]: { title: 'Content', color: 'bg-sky-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    [FeatureName.NetworkingAssistant]: { title: 'Career', color: 'bg-teal-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    [FeatureName.History]: { title: 'System', color: 'bg-slate-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    [FeatureName.Resources]: { title: 'Help', color: 'bg-amber-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    [FeatureName.Privacy]: { title: 'Legal', color: 'bg-slate-400', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    [FeatureName.Terms]: { title: 'Legal', color: 'bg-slate-400', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    [FeatureName.JobSearch]: { title: 'Career', color: 'bg-indigo-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    [FeatureName.JobFetcher]: { title: 'Career', color: 'bg-blue-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    [FeatureName.InterviewPrep]: { title: 'Career', color: 'bg-primary-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> },
    [FeatureName.SavedJob]: { title: 'Saved', color: 'bg-rose-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> },
    // Fix: Added missing FeatureName entries to satisfy Record<FeatureName, ...> type.
    [FeatureName.Settings]: { title: 'Settings', color: 'bg-slate-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    [FeatureName.Auth]: { title: 'System', color: 'bg-primary-500', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
};

const ProjectCard: React.FC<{ item: HistoryItem; onRename: (name: string) => void; onView: () => void; onDelete: () => void; }> = ({ item, onRename, onView, onDelete }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(item.title);
    const meta = FEATURE_META[item.featureType];

    const handleRenameSubmit = () => {
        onRename(newName);
        setIsRenaming(false);
    };

    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className={`h-1.5 w-full ${meta.color}`} />
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${meta.color} bg-opacity-10 text-slate-600 dark:text-slate-400`}>
                        {meta.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {meta.title}
                    </span>
                </div>

                {isRenaming ? (
                    <div className="flex gap-2 mb-2">
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                        />
                        <button onClick={handleRenameSubmit} className="text-primary-600 font-bold text-xs">Save</button>
                    </div>
                ) : (
                    <h3
                        className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 hover:text-primary-600 cursor-pointer"
                        onClick={onView}
                    >
                        {item.title}
                    </h3>
                )}

                <div className="flex items-center gap-2 mt-auto pt-4 text-[10px] text-slate-400 font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
                    {new Date(item.timestamp).toLocaleDateString()}
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsRenaming(true)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 transition-colors"
                        title="Rename Project"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2} /></svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Project"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" strokeWidth={2} /></svg>
                    </button>
                </div>
                <Button variant="secondary" onClick={onView} className="h-7 text-[10px] px-3">Open Project</Button>
            </div>
        </div>
    );
};


export const History: React.FC = () => {
    const { history, isLoaded, deleteHistoryItem, updateHistoryItem, clearHistory } = useHistory();
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'Content' | 'Career' | 'Branding' | 'Saved'>('all');

    const filteredHistory = useMemo(() => {
        if (filter === 'all') return history;
        return history.filter(item => FEATURE_META[item.featureType].title === filter);
    }, [history, filter]);

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center p-20">
                <Spinner size="lg" />
            </div>
        );
    }

    if (selectedItem) {
        return <HistoryResultDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                        Project History
                    </h2>
                    <p className="text-slate-500 font-medium">Manage and refine your previous AI-powered generations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['all', 'Content', 'Career', 'Branding', 'Saved'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === cat ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => confirm('Clear all projects?') && clearHistory()}
                            className="text-xs font-bold text-red-500 hover:underline px-4"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">No projects found</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                        Your generated content will appear here automatically. Start by using one of the AI tools!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {filteredHistory.map(item => (
                        <ProjectCard
                            key={item.id}
                            item={item}
                            onRename={(name) => updateHistoryItem(item.id, { title: name })}
                            onView={() => setSelectedItem(item)}
                            onDelete={() => deleteHistoryItem(item.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

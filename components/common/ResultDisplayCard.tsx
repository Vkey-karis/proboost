
import React, { useState, useEffect } from 'react';
import { ActionButtons } from './ActionButtons.tsx';
import { Textarea } from './Textarea.tsx';

interface ResultDisplayCardProps {
  title: string;
  content: string;
  onContentChange?: (newContent: string) => void;
  layout?: 'social' | 'generic';
  actions: {
    textToCopy: string;
    downloadFilename: string;
    downloadableText: string;
    shareableTitle?: string;
    shareableText?: string;
  };
}

export const ResultDisplayCard: React.FC<ResultDisplayCardProps> = ({ title, content, actions, onContentChange, layout = 'generic' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editBuffer, setEditBuffer] = useState(content);

    useEffect(() => {
        setEditBuffer(content);
    }, [content]);

    const handleSave = () => {
        if (onContentChange) {
            onContentChange(editBuffer);
        }
        setIsEditing(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-primary-500/10 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-primary-800 dark:text-primary-200">{title}</h3>
                    <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                            isEditing 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 border border-slate-300 dark:border-slate-600'
                        }`}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>
                <ActionButtons {...actions} layout={layout} />
            </div>
            <div className="p-4">
                {isEditing ? (
                    <Textarea 
                        value={editBuffer} 
                        onChange={(e) => setEditBuffer(e.target.value)} 
                        className="w-full min-h-[200px] text-sm text-slate-700 dark:text-slate-300 focus:ring-primary-500 border-primary-100 dark:border-slate-700"
                    />
                ) : (
                    <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{content}</p>
                )}
            </div>
        </div>
    );
};

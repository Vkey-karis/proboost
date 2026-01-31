
import React, { useState, useEffect } from 'react';
import { PostDraft } from '../types.ts';
import { ActionButtons } from './common/ActionButtons.tsx';
import { Textarea } from './common/Textarea.tsx';

interface ResultCardProps {
    draft: PostDraft;
    onUpdate?: (updatedDraft: PostDraft) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ draft, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState<PostDraft>(draft);

  useEffect(() => {
    setEditedDraft(draft);
  }, [draft]);

  const handleSave = () => {
    if (onUpdate) {
        onUpdate(editedDraft);
    }
    setIsEditing(false);
  };

  const hashtagsArray = editedDraft.hashtags || [];
  const formattedHashtags = hashtagsArray.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');

  const fullContent = `
Post Text:
---
${editedDraft.postText || ''}

Hashtags:
---
${formattedHashtags}

Suggested First Comment:
---
${editedDraft.firstComment || ''}

LinkedIn Story Version:
---
${editedDraft.storyVersion || ''}
  `.trim();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden animate-fade-in flex flex-col border border-slate-100 dark:border-slate-700">
      <div className="p-4 bg-primary-500 text-white flex justify-between items-center">
        <h3 className="font-bold text-lg">{editedDraft.tone || 'Draft'}</h3>
        <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors border ${
                isEditing 
                ? 'bg-white text-primary-600 border-white hover:bg-slate-100' 
                : 'bg-primary-600 text-white border-primary-400 hover:bg-primary-700'
            }`}
        >
            {isEditing ? 'Save Changes' : 'Edit Post'}
        </button>
      </div>
      <div className="p-4 space-y-4 flex-grow">
        <div>
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Post Text</h4>
          {isEditing ? (
              <Textarea 
                value={editedDraft.postText} 
                onChange={(e) => setEditedDraft({...editedDraft, postText: e.target.value})} 
                rows={10}
                className="text-sm"
              />
          ) : (
              <div className="p-3 rounded-md bg-slate-100 dark:bg-slate-900/50 whitespace-pre-wrap text-sm leading-relaxed">
                {editedDraft.postText || 'No text content.'}
              </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Hashtags</h4>
              {isEditing ? (
                  <Textarea 
                    value={hashtagsArray.join(', ')} 
                    onChange={(e) => setEditedDraft({...editedDraft, hashtags: e.target.value.split(',').map(s => s.trim())})} 
                    rows={2}
                    className="text-sm"
                  />
              ) : (
                  <div className="p-3 rounded-md bg-slate-100 dark:bg-slate-900/50 text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {formattedHashtags || 'No hashtags.'}
                  </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">LinkedIn Story Version</h4>
              {isEditing ? (
                  <Textarea 
                    value={editedDraft.storyVersion || ''} 
                    onChange={(e) => setEditedDraft({...editedDraft, storyVersion: e.target.value})} 
                    rows={2}
                    className="text-sm"
                  />
              ) : (
                  <div className="p-3 rounded-md bg-slate-100 dark:bg-slate-900/50 text-sm italic">
                    {editedDraft.storyVersion || 'No story teaser.'}
                  </div>
              )}
            </div>
        </div>

        {!isEditing && (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Suggested First Comment</h4>
              <div className="p-3 rounded-md bg-slate-100 dark:bg-slate-900/50 text-sm italic border-l-4 border-primary-200">
                {editedDraft.firstComment || 'No comment suggestion.'}
              </div>
            </div>
        )}
      </div>
      <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <ActionButtons 
            textToCopy={fullContent}
            downloadableText={fullContent}
            downloadFilename={`linkedin-post-${(editedDraft.tone || 'post').toLowerCase().replace(' ', '-')}`}
            shareableTitle={`LinkedIn Post Idea (${editedDraft.tone || 'Draft'})`}
            shareableText={editedDraft.postText}
            layout="social"
          />
      </div>
    </div>
  );
};

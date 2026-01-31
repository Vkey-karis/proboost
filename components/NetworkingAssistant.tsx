
import React, { useState } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { Textarea } from './common/Textarea.tsx';
import { Select } from './common/Select.tsx';
import { Spinner } from './common/Spinner.tsx';
import { generateNetworkingMessage } from '../services/geminiService.ts';
import { ActionButtons } from './common/ActionButtons.tsx';
import { useHistory } from '../hooks/useHistory.ts';
import { FeatureName } from '../types.ts';

const NETWORKING_OBJECTIVES = [
  'Connection Request',
  'Informational Interview',
  'Coffee Chat',
  'Referral Request',
  'Job Inquiry',
  'Collaboration Proposal',
  'Feedback / Advice',
  'Alumni Outreach',
  'Speaker Invitation',
  'Mentorship Request'
];

export const NetworkingAssistant: React.FC = () => {
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState(NETWORKING_OBJECTIVES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ connectionRequest: string; followUp: string } | null>(null);
  
  const { addHistoryItem } = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;

    setIsLoading(true);
    try {
      const result = await generateNetworkingMessage(role, context, goal);
      setMessages(result);
      
      // Save to projects history
      addHistoryItem({
        featureType: FeatureName.NetworkingAssistant,
        input: { role, context, goal },
        output: result
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Networking & DM Pro</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Target Recipient Role</label>
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Head of Talent at Netflix" required />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Primary Objective</label>
              <Select value={goal} onChange={e => setGoal(e.target.value)}>
                {NETWORKING_OBJECTIVES.map(obj => (
                    <option key={obj} value={obj}>{obj}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Personal Context (Why are you reaching out?)</label>
            <Textarea 
              rows={3}
              value={context} 
              onChange={e => setContext(e.target.value)} 
              placeholder="e.g. 'I've followed your work on UX accessibility for years' or 'We both studied at University of Toronto'..." 
            />
          </div>
          <Button type="submit" disabled={isLoading || !role} className="w-full h-14 text-lg uppercase tracking-widest font-black">
            {isLoading ? <Spinner size="sm" className="text-white" /> : 'Generate Outreach Sequence'}
          </Button>
        </form>
      </div>

      {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-pulse">
              <Spinner size="lg" className="mb-4" />
              <p className="text-lg font-bold">Drafting personalized messages...</p>
              <p className="text-sm text-slate-500">Gemini is finding the perfect hook for your objective.</p>
          </div>
      )}

      {messages && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in pb-12">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-300">
                1. Initial Connection Request
              </h3>
              <ActionButtons textToCopy={messages.connectionRequest} downloadableText={messages.connectionRequest} downloadFilename="connection-request" />
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-inner italic text-sm text-slate-700 dark:text-slate-300 border-l-4 border-blue-500 leading-relaxed">
               "{messages.connectionRequest}"
            </div>
            <div className="mt-4 flex items-center gap-2">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Safe for LinkedIn's 300 character limit</p>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-800 dark:text-indigo-300">
                2. Personalized Follow-up
              </h3>
              <ActionButtons textToCopy={messages.followUp} downloadableText={messages.followUp} downloadFilename="follow-up" />
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-inner text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
               {messages.followUp}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

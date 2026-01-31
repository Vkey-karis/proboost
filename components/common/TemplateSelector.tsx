
import React from 'react';
import { ProfileTemplate } from '../../types.ts';

interface TemplateOption {
  id: ProfileTemplate;
  title: string;
  description: string;
  preview: React.ReactNode;
}

const ModernPreview = () => (
  <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded p-2 flex flex-col gap-1.5 overflow-hidden">
    <div className="h-2 w-full bg-primary-500 rounded-t-sm -mt-2 -mx-2 mb-1" />
    <div className="h-1.5 w-1/3 bg-primary-200 rounded" />
    <div className="flex gap-1 mt-1">
      <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-grow space-y-1">
        <div className="h-1 w-full bg-slate-200 rounded" />
        <div className="h-1 w-5/6 bg-slate-200 rounded" />
      </div>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded mt-1" />
    <div className="h-1 w-4/6 bg-slate-100 rounded" />
  </div>
);

const ClassicPreview = () => (
  <div className="w-full h-24 bg-white border border-slate-200 rounded p-2 flex flex-col items-center gap-1.5 overflow-hidden">
    <div className="h-2 w-1/2 bg-slate-800 rounded mt-1" />
    <div className="h-1 w-3/4 bg-slate-300 rounded mb-1" />
    <div className="w-full space-y-1 mt-1">
      <div className="h-1 w-full bg-slate-100 rounded" />
      <div className="h-1 w-full bg-slate-100 rounded" />
      <div className="h-1 w-11/12 bg-slate-100 rounded" />
    </div>
    <div className="h-1.5 w-1/4 bg-slate-400 rounded mt-1" />
  </div>
);

const MinimalistPreview = () => (
  <div className="w-full h-24 bg-white border border-slate-100 rounded p-3 flex flex-col gap-2 overflow-hidden">
    <div className="h-2 w-1/4 bg-slate-900 rounded" />
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-2 items-center">
        <div className="w-1 h-1 rounded-full bg-slate-400" />
        <div className="h-1 w-full bg-slate-100 rounded" />
      </div>
      <div className="flex gap-2 items-center">
        <div className="w-1 h-1 rounded-full bg-slate-400" />
        <div className="h-1 w-5/6 bg-slate-100 rounded" />
      </div>
    </div>
  </div>
);

const TEMPLATES: TemplateOption[] = [
  {
    id: 'modern',
    title: 'Modern',
    description: 'Dynamic & bold. Best for tech, creative, and startup roles.',
    preview: <ModernPreview />
  },
  {
    id: 'classic',
    title: 'Classic',
    description: 'Formal & balanced. Best for law, finance, and corporate roles.',
    preview: <ClassicPreview />
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    description: 'Clean & direct. Best for efficiency and high-level executives.',
    preview: <MinimalistPreview />
  }
];

interface TemplateSelectorProps {
  selected: ProfileTemplate;
  onSelect: (id: ProfileTemplate) => void;
  label?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selected, onSelect, label }) => {
  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl.id)}
            className={`relative p-3 rounded-xl border-2 text-left transition-all ${
              selected === tpl.id
                ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10 ring-2 ring-primary-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300'
            }`}
          >
            {selected === tpl.id && (
              <div className="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full p-1 shadow-lg z-10">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="mb-3">
              {tpl.preview}
            </div>
            <h4 className="font-bold text-sm mb-1">{tpl.title}</h4>
            <p className="text-[10px] text-slate-500 leading-tight">{tpl.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

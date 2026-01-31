
import React, { useState, useEffect, useRef } from 'react';
import { 
    downloadAsTxt, 
    downloadAsPdf, 
    downloadAsDocx, 
    shareText, 
    shareToLinkedIn, 
    shareToTwitter, 
    shareToWhatsApp 
} from '../../utils/export.ts';
import { translateContent } from '../../services/geminiService.ts';
import { Language } from '../../types.ts';
import { Spinner } from './Spinner.tsx';

interface ActionButtonsProps {
  textToCopy: string;
  downloadFilename: string;
  downloadableText: string;
  shareableTitle?: string;
  shareableText?: string;
  layout?: 'social' | 'generic';
  onTranslate?: (translatedText: string) => void;
}

const ActionButton: React.FC<{ onClick?: () => void; children: React.ReactNode; 'aria-label': string; className?: string }> = ({ onClick, children, 'aria-label': ariaLabel, className = '' }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ${className}`}
    >
        {children}
    </button>
);

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'it', label: 'Italian', flag: '🇮🇹' },
    { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'la', label: 'Latin', flag: '🏛️' },
];

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  textToCopy,
  downloadFilename,
  downloadableText,
  shareableTitle,
  shareableText,
  layout = 'generic',
  onTranslate
}) => {
  const [copied, setCopied] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const downloadRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownload(false);
      }
      if (translateRef.current && !translateRef.current.contains(event.target as Node)) {
        setShowTranslate(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTranslate = async (lang: string) => {
    if (!onTranslate) return;
    setIsTranslating(true);
    setShowTranslate(false);
    try {
        const result = await translateContent(textToCopy, lang);
        onTranslate(result);
    } catch (e) {
        alert("Translation failed. Please try again.");
    } finally {
        setIsTranslating(false);
    }
  };

  const handleLinkedInShare = () => {
    shareToLinkedIn(shareableText || textToCopy);
  };

  const handleTwitterShare = () => {
    shareToTwitter(shareableText || textToCopy);
  };

  const handleWhatsAppShare = () => {
    shareToWhatsApp(shareableText || textToCopy);
  };

  const handleNativeShare = () => {
    shareText(shareableTitle || 'ProBoost AI Content', shareableText || textToCopy);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
      <ActionButton onClick={handleCopy} aria-label="Copy to clipboard">
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        )}
      </ActionButton>

      {/* Specific Social Platform Buttons */}
      {layout === 'social' && (
        <>
          <ActionButton onClick={handleLinkedInShare} aria-label="Share to LinkedIn" className="hover:text-[#0a66c2] dark:hover:text-[#0a66c2]">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </ActionButton>
          <ActionButton onClick={handleTwitterShare} aria-label="Share to Twitter" className="hover:text-black dark:hover:text-white">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </ActionButton>
          <ActionButton onClick={handleWhatsAppShare} aria-label="Share to WhatsApp" className="hover:text-[#25d366] dark:hover:text-[#25d366]">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.522.902 3.274 1.378 5.066 1.379 5.313 0 9.637-4.322 9.64-9.635.001-2.574-1.003-4.993-2.827-6.816-1.825-1.824-4.247-2.827-6.824-2.828-5.312 0-9.635 4.323-9.637 9.637 0 1.834.52 3.626 1.501 5.17l-.995 3.633 3.722-.976zm11.37-6.194c-.314-.157-1.86-.918-2.148-1.023-.288-.105-.499-.157-.708.157-.21.315-.812 1.024-.995 1.233-.183.21-.366.236-.68.079-.314-.158-1.328-.489-2.529-1.56-.935-.834-1.565-1.865-1.748-2.18-.183-.314-.02-.485.137-.641.141-.14.314-.366.471-.55.157-.183.21-.314.314-.524.105-.21.052-.393-.026-.55-.079-.157-.708-1.705-.97-2.333-.254-.611-.512-.529-.708-.538-.182-.008-.392-.01-.602-.01s-.55.079-.837.393c-.288.315-1.1 1.074-1.1 2.62 0 1.546 1.127 3.041 1.284 3.251.157.21 2.217 3.385 5.371 4.746.751.325 1.335.518 1.791.663.754.24 1.44.207 1.983.125.604-.093 1.86-.76 2.122-1.467.261-.707.261-1.31.183-1.467-.078-.157-.287-.236-.601-.393z"/></svg>
          </ActionButton>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 self-center mx-1"></div>
        </>
      )}

      {/* Primary Generic W3C Web Share API Button */}
      <ActionButton onClick={handleNativeShare} aria-label="Share via native device" className="hover:text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
      </ActionButton>

      {/* Translation Button */}
      {onTranslate && (
        <div className="relative" ref={translateRef}>
            <ActionButton onClick={() => setShowTranslate(!showTranslate)} aria-label="Translate content">
                {isTranslating ? (
                    <Spinner size="sm" />
                ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
            </ActionButton>
            {showTranslate && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-2xl border border-slate-200 dark:border-slate-700 z-[110] py-2 animate-in fade-in slide-in-from-top-1 max-h-[300px] overflow-y-auto">
                    <div className="px-3 py-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Language</span>
                    </div>
                    {LANGUAGES.map((l) => (
                        <button 
                            key={l.code} 
                            onClick={() => handleTranslate(l.label)} 
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                        >
                            <span>{l.flag} {l.label}</span>
                            <span className="text-[8px] font-bold text-slate-400 opacity-50 uppercase">{l.code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}
      
       <div className="relative" ref={downloadRef}>
            <ActionButton onClick={() => setShowDownload(prev => !prev)} aria-label="Download options">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </ActionButton>
            {showDownload && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-md shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] py-1 animate-in fade-in slide-in-from-top-1">
                    <button onClick={() => { downloadAsTxt(downloadFilename, downloadableText); setShowDownload(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold uppercase tracking-widest text-[10px]">As .txt</button>
                    <button onClick={() => { downloadAsPdf(downloadFilename, downloadableText); setShowDownload(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold uppercase tracking-widest text-[10px]">As .pdf</button>
                    <button onClick={() => { downloadAsDocx(downloadFilename, downloadableText); setShowDownload(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold uppercase tracking-widest text-[10px]">As .docx</button>
                </div>
            )}
        </div>
    </div>
  );
};

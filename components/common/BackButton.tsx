import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string; // Allow custom classes
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "Back to Dashboard", className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`group flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors mb-6 ${className}`}
        >
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </div>
            <span>{label}</span>
        </button>
    );
};

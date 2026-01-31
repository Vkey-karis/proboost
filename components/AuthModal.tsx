
import React, { useState } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');

    return (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/80 backdrop-blur-sm animate-fade-in" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                {/* Overlay background click to close */}
                <div className="fixed inset-0 transition-opacity bg-transparent" onClick={onClose} aria-hidden="true"></div>

                <div className="relative transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-700 animate-slide-up">

                    {/* Close Button */}
                    <div className="absolute top-0 right-0 pt-6 pr-6 z-10">
                        <button
                            type="button"
                            className="rounded-full bg-slate-100 dark:bg-slate-700 p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-8 pb-10 pt-10 sm:p-12">
                        <div className="sm:mx-auto sm:w-full sm:max-w-md">
                            <div className="bg-primary-50 dark:bg-primary-900/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary-600 shadow-inner ring-1 ring-primary-100 dark:ring-primary-800">
                                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>

                            <h3 className="text-center text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white" id="modal-title">
                                {mode === 'login' ? 'Welcome Back!' : 'Join the Club'}
                            </h3>
                            <p className="mt-3 text-center text-slate-500 dark:text-slate-400 font-medium">
                                {mode === 'login' ? 'Great to see you again. Let\'s get back to work.' : 'Start your journey to a better career today.'}
                            </p>
                        </div>

                        <div className="mt-10">
                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Login logic placeholder! Connect to Firebase or Supabase here."); onClose(); }}>
                                {mode === 'register' && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Full Name</label>
                                        <div className="mt-1 relative rounded-2xl shadow-sm">
                                            <Input
                                                placeholder="e.g. Victor Smith"
                                                required
                                                className="block w-full h-14 rounded-2xl border-0 py-1.5 pl-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Email Address</label>
                                    <div className="mt-1 relative rounded-2xl shadow-sm">
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                            className="block w-full h-14 rounded-2xl border-0 py-1.5 pl-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Password</label>
                                    <div className="mt-1 relative rounded-2xl shadow-sm">
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            className="block w-full h-14 rounded-2xl border-0 py-1.5 pl-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="flex w-full h-14 items-center justify-center rounded-2xl bg-primary-600 px-3 py-1.5 text-sm font-black uppercase tracking-widest leading-6 text-white shadow-lg hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all active:scale-[0.98]"
                                        rightIcon={<svg className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>}
                                    >
                                        {mode === 'login' ? 'Sign Me In' : 'Create My Account'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-8 py-6 sm:px-12">
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="ml-1 font-bold text-primary-600 hover:text-primary-500 underline transition-colors"
                            >
                                {mode === 'login' ? 'Sign up for free' : 'Log in here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Inline styles for custom animations if not in tailwind config */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

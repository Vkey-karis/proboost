import React, { useState } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { AuthService } from '../services/authService.ts';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Check if Supabase is configured
            if (!AuthService.isConfigured()) {
                setError('Authentication is not configured. Please contact support.');
                setLoading(false);
                return;
            }

            let result;
            if (mode === 'register') {
                result = await AuthService.signUp(email, password, fullName);
            } else {
                result = await AuthService.signIn(email, password);
            }

            if (result.success) {
                // Success! Close modal and show success message
                onClose();
                alert(mode === 'register'
                    ? 'Account created successfully! Please check your email to verify your account.'
                    : 'Welcome back! You are now signed in.');
            } else {
                setError(result.error || 'An error occurred. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Google sign-in
    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);

        try {
            if (!AuthService.isConfigured()) {
                setError('Authentication is not configured. Please contact support.');
                setLoading(false);
                return;
            }

            const result = await AuthService.signInWithGoogle();
            if (!result.success) {
                setError(result.error || 'Failed to sign in with Google.');
                setLoading(false);
            }
            // If successful, user will be redirected to Google OAuth
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Overlay background click to close */}
            <div className="fixed inset-0 transition-opacity bg-transparent" onClick={onClose} aria-hidden="true"></div>

            {/* Modal Container with max height and scroll */}
            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col transform rounded-[2.5rem] bg-white dark:bg-slate-800 text-left shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up overflow-hidden">

                {/* Close Button - More Prominent */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        type="button"
                        className="rounded-full bg-white dark:bg-slate-900 p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto flex-1 px-8 pb-10 pt-10 sm:p-12">
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

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="mt-8">
                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="flex w-full h-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {loading ? 'Please wait...' : 'Continue with Google'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">Or continue with email</span>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Full Name</label>
                                    <div className="mt-1 relative rounded-2xl shadow-sm">
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="e.g. Victor Smith"
                                            required
                                            disabled={loading}
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        disabled={loading}
                                        className="block w-full h-14 rounded-2xl border-0 py-1.5 pl-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Password</label>
                                <div className="mt-1 relative rounded-2xl shadow-sm">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                        className="block w-full h-14 rounded-2xl border-0 py-1.5 pl-5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full h-14 items-center justify-center rounded-2xl bg-primary-600 px-3 py-1.5 text-sm font-black uppercase tracking-widest leading-6 text-white shadow-lg hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    rightIcon={<svg className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>}
                                >
                                    {loading ? 'Please wait...' : (mode === 'login' ? 'Sign Me In' : 'Create My Account')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="bg-slate-50 dark:bg-slate-700/50 px-8 py-6 sm:px-12">
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="ml-1 font-bold text-primary-600 hover:text-primary-500 underline transition-colors"
                            disabled={loading}
                        >
                            {mode === 'login' ? 'Sign up for free' : 'Log in here'}
                        </button>
                    </p>
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

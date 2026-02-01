import React, { useState, useEffect } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';
import { AuthService } from '../services/authService.ts';

interface AuthPageProps {
    onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset form when mode changes
    useEffect(() => {
        setError(null);
        setFullName('');
        setEmail('');
        setPassword('');
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
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
                setShowSuccess(true);
                setTimeout(() => {
                    onBack();
                }, 1200);
            } else {
                setError(result.error || 'An error occurred. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);

        try {
            if (!AuthService.isConfigured()) {
                setError('Authentication is not configured.');
                setLoading(false);
                return;
            }

            const result = await AuthService.signInWithGoogle();
            if (!result.success) {
                setError(result.error || 'Failed to sign in with Google.');
                setLoading(false);
            }
            // OAuth redirect will happen automatically
        } catch (err) {
            setError('An unexpected error occurred.');
            setLoading(false);
        }
    };

    const handleModeSwitch = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setIsTransitioning(false);
        }, 150);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 animate-fade-in">
            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 bg-green-500/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                    <div className="text-center text-white animate-scale-in">
                        <svg className="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-2xl font-bold">Welcome to ProBoost!</p>
                        <p className="text-sm mt-2 opacity-90">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back to home</span>
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className={`text-center mb-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
                            <div className="mb-4 flex justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                {mode === 'login' ? 'Welcome Back' : 'Join ProBoost'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {mode === 'login' ? 'Sign in to access your dashboard' : 'Create your account in seconds'}
                            </p>
                        </div>

                        {/* Social Auth */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group mb-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            aria-label="Sign in with Google"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                Continue with Google
                            </span>
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-800 px-3 text-slate-400 font-bold tracking-wider">Or with email</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleSubmit} className={`space-y-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-shake">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {mode === 'register' && (
                                <div className="space-y-1 animate-slide-down">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Full Name</label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="dark:bg-slate-900 dark:border-slate-700 transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Email</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="dark:bg-slate-900 dark:border-slate-700 transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="dark:bg-slate-900 dark:border-slate-700 transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                                {mode === 'register' && (
                                    <p className="text-xs text-slate-400 ml-1 mt-1">At least 6 characters</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-200 active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </span>
                                ) : (
                                    mode === 'login' ? 'Sign In' : 'Create Account'
                                )}
                            </Button>
                        </form>

                        {/* Footer Switch */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={handleModeSwitch}
                                    className="ml-1.5 font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors underline-offset-2 hover:underline"
                                >
                                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { 
                        transform: translateY(20px); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateY(0); 
                        opacity: 1; 
                    }
                }
                @keyframes scale-in {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slide-down {
                    from { 
                        transform: translateY(-10px); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateY(0); 
                        opacity: 1; 
                    }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

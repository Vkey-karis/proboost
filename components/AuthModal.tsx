
import React, { useState } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 max-w-md w-full shadow-3xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-8">
                    <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary-600">
                         <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">
                        {mode === 'login' ? 'Welcome Back!' : 'Join the Club'}
                    </h3>
                    <p className="text-slate-500 font-medium mt-2">
                        {mode === 'login' ? 'Let\'s get you back to your work.' : 'Start your journey to a better career today.'}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Login logic placeholder! Connect to Firebase or Supabase here."); onClose(); }}>
                    {mode === 'register' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Full Name</label>
                            <Input placeholder="Your Name" required className="h-14 rounded-2xl px-6" />
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Email Address</label>
                        <Input type="email" placeholder="hello@you.com" required className="h-14 rounded-2xl px-6" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Password</label>
                        <Input type="password" placeholder="••••••••" required className="h-14 rounded-2xl px-6" />
                    </div>

                    <Button type="submit" className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl rounded-2xl bg-primary-600 hover:bg-primary-700 mt-4">
                        {mode === 'login' ? 'Sign Me In' : 'Create My Account'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-xs font-bold text-primary-600 hover:underline"
                    >
                        {mode === 'login' ? 'Don\'t have an account? Sign up here!' : 'Already have an account? Log in here!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

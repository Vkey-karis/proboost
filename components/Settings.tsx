
import React, { useState, useEffect } from 'react';
import { Button } from './common/Button.tsx';
import { Input } from './common/Input.tsx';

export const Settings: React.FC = () => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('PROBOOST_USER_API_KEY') || '');
    const [tier, setTier] = useState('Authority'); // Simulated current tier
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const handleSaveKey = () => {
        localStorage.setItem('PROBOOST_USER_API_KEY', apiKey);
        setSaveStatus('API Key Updated Successfully');
        setTimeout(() => setSaveStatus(null), 3000);
        window.location.reload(); // Refresh to update the singleton client
    };

    const handleClearKey = () => {
        localStorage.removeItem('PROBOOST_USER_API_KEY');
        setApiKey('');
        setSaveStatus('Reverted to Platform Default Tokens');
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handleManagePayment = (method: string) => {
        alert(`Opening ${method} account settings...`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-12">
            <header>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">Account Settings</h1>
                <p className="text-slate-500 font-medium">Manage your subscription, API keys, and partner earnings.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subscription Tier */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Current Subscription</h3>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-3xl font-black text-primary-600">{tier}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Monthly Plan</p>
                        </div>
                        <Button variant="secondary" className="text-[10px] uppercase font-black">Upgrade</Button>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Monthly Token Usage</span>
                            <span className="text-[10px] font-bold text-slate-600">62%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 w-[62%]" />
                        </div>
                    </div>
                </div>

                {/* Payment Methods Placeholder */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Wallet & Payments</h3>
                    <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-[#ffc439]/10 rounded-lg flex items-center justify-center">
                                     <svg className="h-4 w-auto" viewBox="0 0 115 31" fill="none"><path d="M12.923 5.421c0-.44-.04-.844-.12-1.226C12.393 1.944 10.378 0 7.765 0H.841C.46 0 .147.266.046.611L.002.839.046.611 4.298 29.56c.03.204.22.355.434.355h6.39c.25 0 .463-.182.495-.414L12.923 5.42z" fill="#27346A"/></svg>
                                 </div>
                                 <div>
                                     <p className="text-[10px] font-black uppercase text-slate-400">PayPal</p>
                                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Linked Account</p>
                                 </div>
                             </div>
                             <button onClick={() => handleManagePayment('PayPal')} className="text-[10px] font-black uppercase text-primary-600 hover:underline">Manage</button>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-[#00d0e1]/10 rounded-lg flex items-center justify-center">
                                     <div className="w-4 h-4 bg-[#00d0e1] rounded-full" />
                                 </div>
                                 <div>
                                     <p className="text-[10px] font-black uppercase text-slate-400">Paystack</p>
                                     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Not Linked</p>
                                 </div>
                             </div>
                             <button onClick={() => handleManagePayment('Paystack')} className="text-[10px] font-black uppercase text-primary-600 hover:underline">Connect</button>
                         </div>
                    </div>
                </div>

                {/* API Key Management (BYOK) */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Bring Your Own Key (BYOK)</h3>
                        <span className="text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-black uppercase">Agency Feature</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                        Exceeded your token limit? Plug in your personal <strong>Gemini API Key</strong> to continue with infinite scale at wholesale costs.
                    </p>
                    <div className="space-y-4">
                        <Input 
                            type="password" 
                            value={apiKey} 
                            onChange={e => setApiKey(e.target.value)} 
                            placeholder="Enter Gemini API Key..." 
                            className="bg-slate-50 dark:bg-slate-900 h-12"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleSaveKey} className="flex-grow h-12 text-[10px] uppercase font-black">Save Key</Button>
                            <Button onClick={handleClearKey} variant="secondary" className="h-12 text-[10px] uppercase font-black">Clear</Button>
                        </div>
                        {saveStatus && <p className="text-[10px] font-bold text-green-600 text-center uppercase tracking-widest animate-fade-in">{saveStatus}</p>}
                    </div>
                </div>
            </div>

            {/* Partner Dashboard (The 50% Commission) */}
            <div className="bg-slate-950 text-white p-12 rounded-[3rem] border border-white/5 shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Partner Dashboard</h3>
                            <p className="text-slate-400 font-medium">Track your 50% recurring commissions.</p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-5xl font-black text-green-400">$0.00</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Available for Payout</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Total Referrals</p>
                             <p className="text-2xl font-black">0</p>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Conversion Rate</p>
                             <p className="text-2xl font-black">0%</p>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Partner Level</p>
                             <p className="text-2xl font-black text-primary-400 italic">Bronze</p>
                         </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Your Partner Referral Link</label>
                        <div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl">
                             <input 
                                readOnly 
                                value={`https://proboost.ai?ref=user_${Math.random().toString(36).substr(2, 6)}`} 
                                className="bg-transparent border-none text-white flex-grow px-4 text-sm font-mono focus:ring-0" 
                             />
                             <Button className="h-10 px-8 text-[10px] font-black uppercase tracking-widest">Copy Link</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

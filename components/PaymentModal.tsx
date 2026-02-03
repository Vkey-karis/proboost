import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Spinner } from './common/Spinner.tsx';

interface PaymentModalProps {
    plan: string;
    price: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, price, onClose, onSuccess }) => {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // In a real app, you would fetch this from your .env
    // For the user request, I'm setting up the structure.
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

    const handleApprove = (orderId: string) => {
        setSuccess(true);
        setTimeout(() => {
            onSuccess();
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">

                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {!success ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Upgrade to {plan}</h3>
                            <p className="text-slate-500 mt-2 font-medium">Total: <span className="text-slate-900 dark:text-white font-bold">{price}</span></p>
                        </div>

                        <div className="space-y-4">
                            {clientId === "test" && (
                                <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg mb-4 text-center">
                                    Simulator Mode (No Client ID provided yet)
                                </div>
                            )}

                            <PayPalScriptProvider options={{ clientId: clientId, currency: "USD" }}>
                                <PayPalButtons
                                    style={{ layout: "vertical", shape: "rect", borderRadius: 12, label: "pay" }}
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            intent: "CAPTURE",
                                            purchase_units: [
                                                {
                                                    amount: {
                                                        value: price.replace('$', ''),
                                                        currency_code: "USD"
                                                    },
                                                    description: `${plan} Plan Subscription`
                                                },
                                            ],
                                        });
                                    }}
                                    onApprove={async (data, actions) => {
                                        return actions.order!.capture().then((details) => {
                                            handleApprove(details.id!);
                                        });
                                    }}
                                    onError={(err) => {
                                        console.error("PayPal Error:", err);
                                        setError("Payment failed. Please try again.");
                                    }}
                                />
                            </PayPalScriptProvider>

                            {error && <p className="text-center text-red-500 text-xs font-bold mt-2">{error}</p>}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Secure payment processed by PayPal. <br />
                                Includes Guest Checkout for Card Payments.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Payment Successful!</h3>
                        <p className="text-slate-500">Welcome to ProBoost {plan}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

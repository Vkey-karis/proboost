import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

export const useCredits = () => {
    const { user, credits, setCredits, tier, setTier } = useAppContext();
    const [loading, setLoading] = useState(false);

    const fetchCredits = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('credits, tier')
                .eq('id', user.id)
                .maybeSingle();

            if (data && !error) {
                setCredits(data.credits);
                setTier(data.tier || 'free');
            } else if (error) {
                console.error('Error fetching credits:', error);
            }
        } catch (err) {
            console.error('Error fetching credits:', err);
        }
    }, [user, setCredits, setTier]);

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchCredits();
        }
    }, [user, fetchCredits]);

    const isTrialActive = useCallback(() => {
        if (!user || !user.created_at) return false;
        const createdAt = new Date(user.created_at).getTime();
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return (now - createdAt) < twentyFourHours;
    }, [user]);

    const checkCredits = useCallback((cost: number): boolean => {
        if (isTrialActive()) return true;
        return (credits || 0) >= cost;
    }, [credits, isTrialActive]);

    const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
        if (!user) return false;

        if (isTrialActive()) {
            return true; // Free trial, no deduction
        }

        setLoading(true);
        try {
            // Optimistic update
            const oldCredits = credits;
            setCredits(prev => (prev || 0) - cost);

            const { data, error } = await supabase
                .rpc('decrease_credits', { amount: cost });

            if (error || !data) {
                // Revert on error
                console.error("Credit deduction failed:", error);
                setCredits(oldCredits);
                return false;
            }

            return true;
        } catch (err) {
            console.error("Credit deduction error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, credits, setCredits, isTrialActive]);

    return {
        credits,
        tier,
        loading,
        fetchCredits,
        checkCredits,
        deductCredits,
        isTrialActive: isTrialActive()
    };
};

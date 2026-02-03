import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

export const useCredits = () => {
    const { user, credits, setCredits } = useAppContext();
    const [loading, setLoading] = useState(false);

    const fetchCredits = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', user.id)
                .single();

            if (data && !error) {
                setCredits(data.credits);
            }
        } catch (err) {
            console.error('Error fetching credits:', err);
        }
    }, [user, setCredits]);

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchCredits();
        }
    }, [user, fetchCredits]);

    const checkCredits = useCallback((cost: number): boolean => {
        return (credits || 0) >= cost;
    }, [credits]);

    const deductCredits = useCallback(async (cost: number): Promise<boolean> => {
        if (!user) return false;

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
    }, [user, credits, setCredits]);

    return {
        credits,
        loading,
        fetchCredits,
        checkCredits,
        deductCredits
    };
};

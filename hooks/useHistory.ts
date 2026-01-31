
import { useState, useCallback, useEffect } from 'react';
import { HistoryItem, FeatureName } from '../types.ts';

const HISTORY_STORAGE_KEY = 'proboost-ai-history';

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp' | 'title'> & { title?: string }) => {
    // Generate a smart default title if one isn't provided
    const generateDefaultTitle = () => {
        const { featureType, input } = item;
        try {
            switch (featureType) {
                case FeatureName.ContentGenerator: return `Draft: ${input.inputText.substring(0, 20)}...`;
                case FeatureName.JobApplication: return `Job App: ${input.userEmail.split('@')[0]}`;
                case FeatureName.ProfileOptimizer: return `Optimization: ${input.goal}`;
                case FeatureName.NewsToPost: return `Viral: ${input.topic}`;
                case FeatureName.NetworkingAssistant: return `Networking: ${input.role}`;
                case FeatureName.JobPostCreator: return `Hiring: ${input.jobTitle}`;
                default: return 'New Project';
            }
        } catch (e) { return 'Untitled Project'; }
    };

    const newItem: HistoryItem = {
      ...item,
      title: item.title || generateDefaultTitle(),
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setHistory(prevHistory => {
        const updatedHistory = [newItem, ...prevHistory];
        if (updatedHistory.length > 50) updatedHistory.pop();
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save history:", error);
        }
        return updatedHistory;
    });
  }, []);

  const updateHistoryItem = useCallback((id: string, updates: Partial<HistoryItem>) => {
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.map(item => item.id === id ? { ...item, ...updates } : item);
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to update history:", error);
        }
        return updatedHistory;
    });
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.id !== id);
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save history:", error);
        }
        return updatedHistory;
    });
  }, []);
  
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, []);


  return { history, isLoaded, addHistoryItem, updateHistoryItem, deleteHistoryItem, clearHistory };
};

import { FeatureName } from '../types.ts';

type Tier = 'free' | 'hunter' | 'authority' | 'agency';

const TIER_FEATURES: Record<Tier, FeatureName[]> = {
    free: [], // Free tier has no permanent access, relies on Trial logic
    hunter: [
        FeatureName.JobSearch,
        FeatureName.InterviewPrep,
        FeatureName.JobApplication,
        FeatureName.JobFetcher,
        FeatureName.History
    ],
    authority: [
        FeatureName.JobSearch,
        FeatureName.InterviewPrep,
        FeatureName.JobApplication,
        FeatureName.JobFetcher,
        FeatureName.History,
        FeatureName.ProfileOptimizer,
        FeatureName.NewsToPost,
        FeatureName.ContentGenerator,
        FeatureName.NetworkingAssistant,
        FeatureName.ProfileCreator,
        FeatureName.SavedJob,
        FeatureName.CaseStudyWriter,
        FeatureName.JobPostCreator
    ],
    agency: Object.values(FeatureName) // Agency gets everything
};

export const checkFeatureAccess = (tier: string, feature: FeatureName, isTrial: boolean): boolean => {
    // Always allow these
    if (feature === FeatureName.Resources || feature === FeatureName.Settings || feature === FeatureName.Auth || feature === FeatureName.Privacy || feature === FeatureName.Terms) {
        return true;
    }

    if (isTrial) {
        return true;
    }

    const userTier = (tier || 'free') as Tier;
    const allowed = TIER_FEATURES[userTier] || [];

    // Agency Override
    if (userTier === 'agency') return true;

    return allowed.includes(feature);
};


import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { FeatureName } from './types.ts';
import { SkeletonDashboard } from './components/common/SkeletonLoader.tsx';
import { useAppContext } from './contexts/AppContext.tsx';

// Lazy Load Components
const Dashboard = React.lazy(() => import('./components/Dashboard.tsx').then(module => ({ default: module.Dashboard })));
const ContentGenerator = React.lazy(() => import('./components/ContentGenerator.tsx').then(module => ({ default: module.ContentGenerator })));
const ProfileOptimizer = React.lazy(() => import('./components/ProfileOptimizer.tsx').then(module => ({ default: module.ProfileOptimizer })));
const ApplicationAssistant = React.lazy(() => import('./components/ApplicationAssistant.tsx').then(module => ({ default: module.ApplicationAssistant })));
const CaseStudyWriter = React.lazy(() => import('./components/CaseStudyWriter.tsx').then(module => ({ default: module.CaseStudyWriter })));
const JobPostCreator = React.lazy(() => import('./components/JobPostCreator.tsx').then(module => ({ default: module.JobPostCreator })));
const History = React.lazy(() => import('./components/History.tsx').then(module => ({ default: module.History })));
const ProfileCreator = React.lazy(() => import('./components/ProfileCreator.tsx').then(module => ({ default: module.ProfileCreator })));
const NewsToPost = React.lazy(() => import('./components/NewsToPost.tsx').then(module => ({ default: module.NewsToPost })));
const NetworkingAssistant = React.lazy(() => import('./components/NetworkingAssistant.tsx').then(module => ({ default: module.NetworkingAssistant })));
const Resources = React.lazy(() => import('./components/Resources.tsx').then(module => ({ default: module.Resources })));
const Legal = React.lazy(() => import('./components/Legal.tsx').then(module => ({ default: module.Legal })));
const JobSearchTool = React.lazy(() => import('./components/JobSearchTool.tsx').then(module => ({ default: module.JobSearchTool })));
const JobDescriptionFetcher = React.lazy(() => import('./components/JobDescriptionFetcher.tsx').then(module => ({ default: module.JobDescriptionFetcher })));
const InterviewPrepTool = React.lazy(() => import('./components/InterviewPrepTool.tsx').then(module => ({ default: module.InterviewPrepTool })));
const Settings = React.lazy(() => import('./components/Settings.tsx').then(module => ({ default: module.Settings })));
const AuthPage = React.lazy(() => import('./components/AuthPage.tsx').then(module => ({ default: module.AuthPage })));

// Enhanced Loading Fallback with Skeleton
const LoadingFallback = () => (
  <div className="animate-fade-in">
    <SkeletonDashboard />
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
          <div className="text-center space-y-4 p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Something went wrong</h3>
            <p className="text-sm text-red-700 dark:text-red-300">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureName | null>(null);
  const { user } = useAppContext();

  // Handle OAuth callback redirect
  useEffect(() => {
    // Check if we have OAuth tokens in the URL hash (from Supabase OAuth redirect)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Clear the hash from URL immediately
      window.history.replaceState(null, '', window.location.pathname);

      // Ensure we're on the dashboard (not Auth page)
      setActiveFeature(null);
    }
  }, []);

  // Auto-redirect logged-in users away from Auth page to dashboard
  useEffect(() => {
    // If user is logged in and on Auth page, redirect to dashboard
    if (user && activeFeature === FeatureName.Auth) {
      setActiveFeature(null);
    }
  }, [user, activeFeature]);

  // SEO: Dynamic Title Update
  useEffect(() => {
    let title = "ProBoost AI | Your Friendly Career Helper";
    if (activeFeature) {
      // Simple mapping for SEO titles
      const titles: Partial<Record<FeatureName, string>> = {
        [FeatureName.InterviewPrep]: "Interview Prep Pro | ProBoost AI",
        [FeatureName.JobSearch]: "Live Job Search | ProBoost AI",
        [FeatureName.ProfileOptimizer]: "LinkedIn SEO Optimizer | ProBoost AI",
        [FeatureName.JobApplication]: "ATS Resume Helper | ProBoost AI",
        [FeatureName.Resources]: "Pricing & Plans | ProBoost AI",
        [FeatureName.Settings]: "Account Settings | ProBoost AI",
        [FeatureName.NewsToPost]: "News-to-Viral AI | ProBoost AI",
        [FeatureName.Auth]: "Sign In | ProBoost AI",
      };
      title = titles[activeFeature] || `${activeFeature.replace(/([A-Z])/g, ' $1').trim()} | ProBoost AI`;
    }
    document.title = title;
  }, [activeFeature]);

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case FeatureName.InterviewPrep:
        return <InterviewPrepTool onBack={handleBackToDashboard} />;
      case FeatureName.JobSearch:
        return <JobSearchTool onBack={handleBackToDashboard} />;
      case FeatureName.JobFetcher:
        return <JobDescriptionFetcher />;
      case FeatureName.ContentGenerator:
        return <ContentGenerator onBack={handleBackToDashboard} />;
      case FeatureName.ProfileOptimizer:
        return <ProfileOptimizer onBack={handleBackToDashboard} />;
      case FeatureName.ProfileCreator:
        return <ProfileCreator />;
      case FeatureName.JobApplication:
        return <ApplicationAssistant />;
      case FeatureName.CaseStudyWriter:
        return <CaseStudyWriter />;
      case FeatureName.JobPostCreator:
        return <JobPostCreator />;
      case FeatureName.NewsToPost:
        return <NewsToPost />;
      case FeatureName.NetworkingAssistant:
        return <NetworkingAssistant />;
      case FeatureName.History:
        return <History />;
      case FeatureName.Resources:
        return <Resources onSelectFeature={setActiveFeature} />;
      case FeatureName.Settings:
        return <Settings />;
      case FeatureName.Privacy:
        return <Legal type="privacy" />;
      case FeatureName.Terms:
        return <Legal type="terms" />;
      case FeatureName.Auth:
        return <AuthPage onBack={handleBackToDashboard} />;
      default:
        return <Dashboard onSelectFeature={setActiveFeature} />;
    }
  };

  const handleBackToDashboard = useCallback(() => {
    setActiveFeature(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header onBackToDashboard={handleBackToDashboard} onSelectFeature={setActiveFeature} />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {renderActiveFeature()}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer onSelectFeature={setActiveFeature} />
    </div>
  );
};

export default App;

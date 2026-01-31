
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { FeatureName } from './types.ts';
import { Spinner } from './components/common/Spinner.tsx';

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

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="text-center space-y-4">
      <Spinner size="lg" className="text-primary-600 mx-auto" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading experience...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureName | null>(null);

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
      };
      title = titles[activeFeature] || `${activeFeature.replace(/([A-Z])/g, ' $1').trim()} | ProBoost AI`;
    }
    document.title = title;
  }, [activeFeature]);

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case FeatureName.InterviewPrep:
        return <InterviewPrepTool />;
      case FeatureName.JobSearch:
        return <JobSearchTool />;
      case FeatureName.JobFetcher:
        return <JobDescriptionFetcher />;
      case FeatureName.ContentGenerator:
        return <ContentGenerator />;
      case FeatureName.ProfileOptimizer:
        return <ProfileOptimizer />;
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
        <Suspense fallback={<LoadingFallback />}>
          {renderActiveFeature()}
        </Suspense>
      </main>
      <Footer onSelectFeature={setActiveFeature} />
    </div>
  );
};

export default App;

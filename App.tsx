
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ContentGenerator } from './components/ContentGenerator.tsx';
import { ProfileOptimizer } from './components/ProfileOptimizer.tsx';
import { ApplicationAssistant } from './components/ApplicationAssistant.tsx';
import { CaseStudyWriter } from './components/CaseStudyWriter.tsx';
import { JobPostCreator } from './components/JobPostCreator.tsx';
import { History } from './components/History.tsx';
import { FeatureName } from './types.ts';
import { ProfileCreator } from './components/ProfileCreator.tsx';
import { NewsToPost } from './components/NewsToPost.tsx';
import { NetworkingAssistant } from './components/NetworkingAssistant.tsx';
import { Resources } from './components/Resources.tsx';
import { Legal } from './components/Legal.tsx';
import { JobSearchTool } from './components/JobSearchTool.tsx';
import { JobDescriptionFetcher } from './components/JobDescriptionFetcher.tsx';
import { InterviewPrepTool } from './components/InterviewPrepTool.tsx';
import { Settings } from './components/Settings.tsx';

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
        {renderActiveFeature()}
      </main>
      <Footer onSelectFeature={setActiveFeature} />
    </div>
  );
};

export default App;

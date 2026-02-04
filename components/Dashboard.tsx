
import React from 'react';
import { FEATURES } from '../constants.tsx';
import { Feature, FeatureName } from '../types.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

interface DashboardProps {
  onSelectFeature: (feature: FeatureName) => void;
}

const FeatureCard: React.FC<{ feature: Feature, onClick: () => void }> = ({ feature, onClick }) => {
  const { t } = useAppContext();
  const isClickable = !feature.comingSoon;

  const getFeatureTitle = (name: FeatureName) => {
    switch (name) {
      case FeatureName.ContentGenerator: return t('feature_content_gen');
      case FeatureName.ProfileOptimizer: return t('feature_profile_opt');
      case FeatureName.ProfileCreator: return t('feature_profile_cre');
      case FeatureName.JobApplication: return t('feature_job_app');
      case FeatureName.CaseStudyWriter: return t('feature_case_study');
      case FeatureName.JobPostCreator: return t('feature_job_post');
      case FeatureName.NewsToPost: return t('feature_news_to_post');
      case FeatureName.NetworkingAssistant: return t('feature_networking');
      case FeatureName.History: return t('feature_history');
      default: return feature.title;
    }
  };

  const getFeatureDesc = (name: FeatureName) => {
    switch (name) {
      case FeatureName.ContentGenerator: return t('feature_desc_content_gen');
      case FeatureName.ProfileOptimizer: return t('feature_desc_profile_opt');
      case FeatureName.ProfileCreator: return t('feature_desc_profile_cre');
      case FeatureName.JobApplication: return t('feature_desc_job_app');
      case FeatureName.CaseStudyWriter: return t('feature_desc_case_study');
      case FeatureName.JobPostCreator: return t('feature_desc_job_post');
      case FeatureName.NewsToPost: return t('feature_desc_news_to_post');
      case FeatureName.NetworkingAssistant: return t('feature_desc_networking');
      case FeatureName.History: return t('feature_desc_history');
      default: return feature.description;
    }
  };

  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl p-8 flex flex-col items-start
        transform transition-all duration-500 border border-slate-100 dark:border-slate-700
        ${isClickable ? 'hover:-translate-y-2 cursor-pointer' : 'opacity-60'}
      `}
      onClick={isClickable ? onClick : undefined}
      role="link"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`Open ${getFeatureTitle(feature.name)}`}
    >
      <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-2xl mb-6 text-primary-600 transition-transform group-hover:scale-110">
        {feature.icon}
      </div>
      <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
        {getFeatureTitle(feature.name)}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
        {getFeatureDesc(feature.name)}
      </p>

      {feature.comingSoon ? (
        <span className="mt-auto text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
          {t('coming_soon')}
        </span>
      ) : (
        <div className="mt-auto flex w-full items-center justify-between">
          <div className="flex items-center text-sm font-bold text-primary-600 dark:text-primary-400 group">
            <span>Let's start</span>
            <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onSelectFeature }) => {
  const { t, user } = useAppContext();

  const handleFeatureClick = (featureName: FeatureName) => {
    if (!user) {
      onSelectFeature(FeatureName.Auth);
      return;
    }
    onSelectFeature(featureName);
  };

  const handleEditorialClick = (id: string) => {
    onSelectFeature(FeatureName.Resources);
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Friend';

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col xl:flex-row gap-8">

        {/* Left Sidebar / Quick Stats Panel */}
        <div className="xl:w-80 flex-shrink-0 space-y-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {user ? 'Welcome back' : 'Career Booster'}
              </p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6">
                {user ? `Hi, ${firstName}!` : 'Ready to Win?'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-xs font-bold text-slate-500">{user ? 'Current Plan' : 'Status'}</span>
                  <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${user ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400' : 'bg-green-100 text-green-700'
                    }`}>
                    {user ? 'Free Tier' : 'Guest Access'}
                  </span>
                </div>
                <button
                  onClick={() => onSelectFeature(user ? FeatureName.Resources : FeatureName.Auth)}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg ${user
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-primary-400'
                      : 'bg-primary-600 hover:bg-primary-700 text-white animate-pulse'
                    }`}
                >
                  {user ? 'Upgrade' : 'Start for Free'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Placeholder */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">Activity</span>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-black">0</p>
                  <p className="text-[10px] opacity-70 uppercase font-bold">Jobs Applied</p>
                </div>
                <div>
                  <p className="text-3xl font-black">0</p>
                  <p className="text-[10px] opacity-70 uppercase font-bold">Interviews Aced</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow space-y-12">
          {/* Main Header inside Dashboard */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">Your Studio</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">What would you like to build today?</p>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <section aria-label="Feature Suite " className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 stagger-load">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.name}
                feature={feature}
                onClick={() => handleFeatureClick(feature.name)}
              />
            ))}
          </section>

          {/* Tips Section */}
          <section className="pt-12">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pro Tips</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'interview-prep-mastery', title: 'Salary Negotiation', desc: 'Read the guide' },
                { id: 'live-job-hunting', title: 'Speed Searching', desc: 'Save 10 hrs/week' },
                { id: 'jd-optimization', title: 'Profile SEO', desc: 'Get found first' }
              ].map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleEditorialClick(article.id)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-all group"
                >
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors">{article.title}</h4>
                    <p className="text-xs text-slate-500">{article.desc}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

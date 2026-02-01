
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
    // If user is not logged in, redirect to auth page
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

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Metric Bar */}
      <div className="mb-16 bg-slate-900 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-primary-600 rounded-2xl shadow-xl shadow-primary-600/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
          </div>
          <div>
            <h3 className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-1">Time saved for our friends</h3>
            <p className="text-3xl font-black text-white">$1.4M+ <span className="text-primary-400 text-sm font-medium tracking-normal">worth of free time</span></p>
          </div>
        </div>
        <div className="hidden md:block h-12 w-px bg-white/10"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-green-600 rounded-2xl shadow-xl shadow-green-600/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth={2} /></svg>
          </div>
          <div>
            <h3 className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-1">Good news</h3>
            <p className="text-3xl font-black text-white">+22% <span className="text-green-400 text-sm font-medium tracking-normal">better job offers</span></p>
          </div>
        </div>
        <a
          href="#how-it-works"
          onClick={(e) => { e.preventDefault(); onSelectFeature(FeatureName.Resources); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 border border-white/10 backdrop-blur-sm"
        >
          How it works
        </a>
      </div>

      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
          {t('dashboard_title')}
        </h2>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('dashboard_subtitle')}
        </p>
      </div>

      <section aria-label="Feature Suite" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 stagger-load">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.name}
            feature={feature}
            onClick={() => handleFeatureClick(feature.name)}
          />
        ))}
      </section>

      {/* Featured Strategies Section */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-20">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full mb-4">Tips & Tricks</span>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase">How to grow fast</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'interview-prep-mastery', title: 'Feel Confident', desc: 'How to use our tools to ask for a better salary and feel ready for any question.' },
            { id: 'live-job-hunting', title: 'Work Less, Find More', desc: 'Why finding a job should be fast. Spend 15 minutes, not your whole day.' },
            { id: 'jd-optimization', title: 'Make Your Profile Shine', desc: 'How to make your page look so good that companies call you first.' }
          ].map((article) => (
            <button
              key={article.id}
              onClick={() => handleEditorialClick(article.id)}
              className="group text-left p-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all shadow-sm hover:shadow-xl"
            >
              <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">{article.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{article.desc}</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-2 group-hover:gap-3 transition-all">
                Read more
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

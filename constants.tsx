
import React from 'react';
import { Feature, Persona, FeatureName } from './types.ts';

export const PERSONAS: Persona[] = [
  'Consultant',
  'Founder',
  'Student',
  'Marketer',
  'Developer',
  'Sales Professional',
  'Recruiter'
];

const WriteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CreateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
);

export const FEATURES: Feature[] = [
  {
    name: FeatureName.InterviewPrep,
    title: 'Interview Prep Pro',
    description: 'Enter a job or URL and get real-time, 2025-standard interview questions and company culture guides.',
    icon: <ChatIcon />,
  },
  {
    name: FeatureName.JobSearch,
    title: 'Live Job Finder',
    description: 'Search across the entire web for real-time jobs tailored to your unique profile.',
    icon: <SearchIcon />,
  },
  {
    name: FeatureName.JobFetcher,
    title: 'Smart JD Fetcher',
    description: 'Enter a role and we fetch optimized 2025-ready job descriptions automatically.',
    icon: <DocumentIcon />,
  },
  {
    name: FeatureName.NewsToPost,
    title: 'News-to-Viral AI',
    description: 'Transform trending industry news into authoritative LinkedIn posts using Real-time Search.',
    icon: <GlobeIcon />,
  },
  {
    name: FeatureName.NetworkingAssistant,
    title: 'Networking & DM Pro',
    description: 'Generate high-conversion connection requests and follow-ups that actually get replies.',
    icon: <MessageIcon />,
  },
  {
    name: FeatureName.ContentGenerator,
    title: 'AI Content Generator',
    description: 'Create human-like LinkedIn posts from a prompt, notes, or existing text.',
    icon: <WriteIcon />,
  },
  {
    name: FeatureName.ProfileOptimizer,
    title: 'Profile Optimization',
    description: 'Rewrite your headline, about section, and experience to attract opportunities.',
    icon: <ProfileIcon />,
  },
  {
    name: FeatureName.ProfileCreator,
    title: 'LinkedIn Profile Creator',
    description: 'Build a complete, professional LinkedIn profile from scratch for you or your company.',
    icon: <CreateIcon />,
  },
  {
    name: FeatureName.JobApplication,
    title: 'Job Application Assistant',
    description: 'Generate tailored cover letters and resume points from job descriptions.',
    icon: <BriefcaseIcon />,
  },
  {
    name: FeatureName.History,
    title: 'History & Projects',
    description: 'Access all your saved drafts, exports, and activity history in one place.',
    icon: <HistoryIcon />,
  },
];

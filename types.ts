
import React from 'react';

export enum FeatureName {
    ContentGenerator = 'ContentGenerator',
    ProfileOptimizer = 'ProfileOptimizer',
    ProfileCreator = 'ProfileCreator',
    JobApplication = 'JobApplication',
    CaseStudyWriter = 'CaseStudyWriter',
    JobPostCreator = 'JobPostCreator',
    NewsToPost = 'NewsToPost',
    NetworkingAssistant = 'NetworkingAssistant',
    History = 'History',
    Resources = 'Resources',
    Privacy = 'Privacy',
    Terms = 'Terms',
    JobSearch = 'JobSearch',
    JobFetcher = 'JobFetcher',
    InterviewPrep = 'InterviewPrep',
    SavedJob = 'SavedJob',
    Settings = 'Settings',
    Auth = 'Auth'
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'pt' | 'la' | 'ja' | 'ar' | 'zh' | 'ru' | 'it';
export type Theme = 'light' | 'dark';

export interface Feature {
    name: FeatureName;
    title: string;
    description: string;
    icon: React.ReactElement;
    comingSoon?: boolean;
}

export type Persona = 'Consultant' | 'Founder' | 'Student' | 'Marketer' | 'Developer' | 'Sales Professional' | 'Recruiter';

export interface PostDraft {
    tone: string;
    postText: string;
    hashtags: string[];
    firstComment: string;
    storyVersion: string;
}

export interface GroundingSource {
    title: string;
    uri: string;
}

export interface TrendingPostResult {
    posts: PostDraft[];
    sources: GroundingSource[];
}

export type GeneratedContent = PostDraft[];

export type InputType = 'paste' | 'bullets' | 'prompt';

export interface HistoryItem {
    id: string;
    title: string;
    timestamp: number;
    featureType: FeatureName;
    input: any;
    output: any;
}

export interface OptimizedProfile {
    headline: string;
    about: string;
    elevatorPitch: string;
    optimizedEducation: string;
    optimizedSkills: string;
    keywords: string[];
}

export interface ROIAnalysis {
    timeSavedHours: number;
    estimatedValueSaved: string;
    potentialSalaryBoost: string;
    marketValueDescription: string;
}

export interface ApplicationAssets {
    coverLetter: string;
    resume: string;
    roiAnalysis: ROIAnalysis;
}

export type ProfileTemplate = 'modern' | 'classic' | 'minimalist';

export interface JobSearchResult {
    jobs: {
        title: string;
        company: string;
        location: string;
        url: string;
        snippet: string;
        salaryEstimate?: string;
    }[];
    marketAnalysis: string;
    roi: ROIAnalysis;
}

export interface JobDescriptionAssets {
    jobDescription: string;
    requirements: string[];
    interviewQuestions: string[];
    roi: ROIAnalysis;
}

export interface InterviewPrepAssets {
    strategicGuide: string;
    questions: {
        question: string;
        whyTheyAsk: string;
        howToAnswer: string;
    }[];
    companyInsights: string;
    roi: ROIAnalysis;
}

export interface IndividualProfileInput {
    fullName: string;
    industry: string;
    role: string;
    skills: string;
    achievements: string;
    bio: string;
    audience: string;
    cta: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    educationDescription: string;
    template: ProfileTemplate;
}

export interface CompanyProfileInput {
    companyName: string;
    industry: string;
    companySize: string;
    tagline: string;
    mission: string;
    services: string;
    audience: string;
    culture: string;
    template: ProfileTemplate;
}

export interface GeneratedIndividualProfile {
    headline: string;
    aboutSection: string;
    experienceTitle: string;
    experienceDescription: string;
    educationSection: string;
    skillsSection: string;
}

export interface GeneratedCompanyProfile {
    tagline: string;
    overviewSection: string;
    specialties: string[];
}

export interface CaseStudyAssets {
    caseStudy: string;
    storyTeaser: string;
}

export interface JobPostAssets {
    jobDescription: string;
    linkedInPost: string;
}

export interface LinkedInProfileData {
    headline: string;
    about: string;
    education: string;
    skills: string;
    photoUrl?: string;
}

export interface LinkedInImportResult {
    success: boolean;
    data?: LinkedInProfileData;
    error?: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    credits: number;
    tier: 'free' | 'hunter' | 'authority' | 'agency';
    created_at: string;
}

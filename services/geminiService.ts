
import { GoogleGenAI, Type } from "@google/genai";
import type {
  Persona,
  InputType,
  GeneratedContent,
  IndividualProfileInput,
  CompanyProfileInput,
  GeneratedIndividualProfile,
  GeneratedCompanyProfile,
  ProfileTemplate,
  OptimizedProfile,
  ApplicationAssets,
  TrendingPostResult,
  CaseStudyAssets,
  JobPostAssets,
  JobSearchResult,
  JobDescriptionAssets,
  InterviewPrepAssets
} from '../types.ts';

/**
 * Dynamically gets the best available API Key.
 * Priority: 1. LocalStorage (User Provided), 2. Environment Variable
 */
const getApiKey = () => {
  // First, check if user has provided their own API key in settings
  const userKey = localStorage.getItem('PROBOOST_USER_API_KEY');
  if (userKey && userKey.trim().length > 10) return userKey;

  // Fall back to environment variable (VITE_ prefix for client-side access)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  return envKey;
};

const getAIClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No API Key found. Please add one in Settings or contact support.");
  }
  return new GoogleGenAI({ apiKey });
};

const FAST_MODEL = 'gemini-flash-lite-latest';
const SMART_MODEL = 'gemini-3-flash-preview';
const PRO_THINKING_MODEL = 'gemini-3-pro-preview';

const READABILITY_GUIDELINES = `
  TONE & STYLE RULES:
  - You are a very friendly and helpful Career Friend. 
  - Use very simple words, like you're talking to a friend in grade school.
  - No big corporate words, no jargon, and no confusing buzzwords.
  - Keep your paragraphs very short (just 1 or 2 sentences each).
  - Use lots of space between paragraphs so it's easy to read.
  - Sound warm, encouraging, and human. 
  - For LinkedIn, make sure there's a good "hook" at the start to catch people's eyes.
`;

const ROI_PROMPT_TEMPLATE = `
    VALUE ANALYSIS:
    Don't use boring stats. Tell the user how you're helping them in simple words:
    1. "timeSavedHours": How many hours they saved (just a number).
    2. "estimatedValueSaved": How much that time is worth (e.g. "$500").
    3. "potentialSalaryBoost": How much more money they could make (e.g. "+$10k").
    4. "marketValueDescription": A very simple and warm explanation of why this help is great for them.
`;

export const translateContent = async (text: string, targetLanguage: string): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Please translate this for me into ${targetLanguage}. Keep it very friendly and simple. TEXT: ${text}`;
  try {
    const response = await ai.models.generateContent({ model: FAST_MODEL, contents: prompt });
    return response.text || text;
  } catch (error) { throw new Error("Translation failed."); }
};

export const generateLinkedInPosts = async (inputType: InputType, inputText: string, persona: Persona, wordCount: number, tone: string = 'Professional'): Promise<GeneratedContent> => {
  const ai = getAIClient();
  const prompt = `Help me write 3 simple LinkedIn posts for a ${persona}. INPUT: "${inputText}" TONE: ${tone}. Use about ${wordCount} words. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING },
            postText: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            firstComment: { type: Type.STRING },
            storyVersion: { type: Type.STRING }
          },
          required: ['tone', 'postText', 'hashtags', 'firstComment', 'storyVersion']
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateApplicationAssets = async (jobDescription: string, resumeInfo: string, userEmail: string, template: ProfileTemplate = 'modern', atsCompliance: boolean = false): Promise<ApplicationAssets> => {
  const ai = getAIClient();
  const prompt = `I need a simple resume and cover letter. JOB: ${jobDescription} USER INFO: ${resumeInfo} ${ROI_PROMPT_TEMPLATE} ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: PRO_THINKING_MODEL,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coverLetter: { type: Type.STRING },
          resume: { type: Type.STRING },
          roiAnalysis: {
            type: Type.OBJECT,
            properties: {
              timeSavedHours: { type: Type.NUMBER },
              estimatedValueSaved: { type: Type.STRING },
              potentialSalaryBoost: { type: Type.STRING },
              marketValueDescription: { type: Type.STRING }
            },
            required: ['timeSavedHours', 'estimatedValueSaved', 'potentialSalaryBoost', 'marketValueDescription']
          }
        },
        required: ['coverLetter', 'resume', 'roiAnalysis']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateInterviewGuide = async (jobDetails: string, companyName?: string): Promise<InterviewPrepAssets> => {
  const ai = getAIClient();
  const prompt = `Let's help someone get ready for an interview at ${companyName || 'this company'}. JOB DETAILS: "${jobDetails}" ${READABILITY_GUIDELINES} ${ROI_PROMPT_TEMPLATE}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategicGuide: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                whyTheyAsk: { type: Type.STRING },
                howToAnswer: { type: Type.STRING }
              },
              required: ['question', 'whyTheyAsk', 'howToAnswer']
            }
          },
          companyInsights: { type: Type.STRING },
          roi: {
            type: Type.OBJECT,
            properties: {
              timeSavedHours: { type: Type.NUMBER },
              estimatedValueSaved: { type: Type.STRING },
              potentialSalaryBoost: { type: Type.STRING },
              marketValueDescription: { type: Type.STRING }
            },
            required: ['timeSavedHours', 'estimatedValueSaved', 'potentialSalaryBoost', 'marketValueDescription']
          }
        },
        required: ['strategicGuide', 'questions', 'companyInsights', 'roi']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const searchLiveJobs = async (profileSummary: string, location: string): Promise<JobSearchResult> => {
  const ai = getAIClient();
  const prompt = `Please find 5 active jobs for someone who says: "${profileSummary}" in "${location}". Give them some simple advice too. ${ROI_PROMPT_TEMPLATE} ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                url: { type: Type.STRING },
                snippet: { type: Type.STRING },
                salaryEstimate: { type: Type.STRING }
              },
              required: ['title', 'company', 'location', 'url', 'snippet']
            }
          },
          marketAnalysis: { type: Type.STRING },
          roi: {
            type: Type.OBJECT,
            properties: {
              timeSavedHours: { type: Type.NUMBER },
              estimatedValueSaved: { type: Type.STRING },
              potentialSalaryBoost: { type: Type.STRING },
              marketValueDescription: { type: Type.STRING }
            },
            required: ['timeSavedHours', 'estimatedValueSaved', 'potentialSalaryBoost', 'marketValueDescription']
          }
        },
        required: ['jobs', 'marketAnalysis', 'roi']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateTrendingPosts = async (topic: string, persona: Persona): Promise<TrendingPostResult> => {
  const ai = getAIClient();
  const prompt = `Find 3 fun news items about "${topic}" and let's write simple posts for a ${persona}. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          posts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tone: { type: Type.STRING },
                postText: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                firstComment: { type: Type.STRING },
                storyVersion: { type: Type.STRING }
              },
              required: ['tone', 'postText', 'hashtags', 'firstComment', 'storyVersion']
            }
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                uri: { type: Type.STRING }
              },
              required: ['title', 'uri']
            }
          }
        },
        required: ['posts', 'sources']
      }
    },
  });
  return JSON.parse(response.text.trim());
};

export const optimizeLinkedInProfile = async (profile: any, goal: string): Promise<OptimizedProfile> => {
  const ai = getAIClient();
  const prompt = `Let's make this LinkedIn profile look great. GOAL: ${goal}. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: PRO_THINKING_MODEL,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          about: { type: Type.STRING },
          elevatorPitch: { type: Type.STRING },
          optimizedEducation: { type: Type.STRING },
          optimizedSkills: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['headline', 'about', 'elevatorPitch', 'optimizedEducation', 'optimizedSkills', 'keywords']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateCaseStudy = async (problem: string, solution: string, result: string): Promise<CaseStudyAssets> => {
  const ai = getAIClient();
  const prompt = `Turn this win into a short, simple story: ${problem}, ${solution}, ${result}. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { caseStudy: { type: Type.STRING }, storyTeaser: { type: Type.STRING } },
        required: ['caseStudy', 'storyTeaser']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const fetchOptimizedJobDescription = async (role: string, industry: string): Promise<JobDescriptionAssets> => {
  const ai = getAIClient();
  const prompt = `Write a simple job description for a "${role}" in "${industry}". ${READABILITY_GUIDELINES} ${ROI_PROMPT_TEMPLATE}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobDescription: { type: Type.STRING },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          roi: {
            type: Type.OBJECT,
            properties: {
              timeSavedHours: { type: Type.NUMBER },
              estimatedValueSaved: { type: Type.STRING },
              potentialSalaryBoost: { type: Type.STRING },
              marketValueDescription: { type: Type.STRING }
            },
            required: ['timeSavedHours', 'estimatedValueSaved', 'potentialSalaryBoost', 'marketValueDescription']
          }
        },
        required: ['jobDescription', 'requirements', 'interviewQuestions', 'roi']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateJobPost = async (jt: string, cn: string, desc: string, loc: string, et: string, ad: string, hm: string): Promise<JobPostAssets> => {
  const ai = getAIClient();
  const prompt = `Write a friendly hiring post for a ${jt} at ${cn}. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { jobDescription: { type: Type.STRING }, linkedInPost: { type: Type.STRING } },
        required: ['jobDescription', 'linkedInPost']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateNetworkingMessage = async (recipientRole: string, context: string, goal: string) => {
  const ai = getAIClient();
  const prompt = `Write two short, friendly messages for a ${recipientRole}. Goal: ${goal}. Context: ${context}. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: SMART_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { connectionRequest: { type: Type.STRING }, followUp: { type: Type.STRING } },
        required: ['connectionRequest', 'followUp']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateNewProfile = async (type: string, data: any) => {
  const ai = getAIClient();
  const prompt = `Build a new simple ${type} profile. ${READABILITY_GUIDELINES}`;
  const response = await ai.models.generateContent({
    model: PRO_THINKING_MODEL,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          aboutSection: { type: Type.STRING },
          experienceTitle: { type: Type.STRING },
          experienceDescription: { type: Type.STRING },
          educationSection: { type: Type.STRING },
          skillsSection: { type: Type.STRING },
          tagline: { type: Type.STRING },
          overviewSection: { type: Type.STRING },
          specialties: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateProfilePhoto = async (prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: `professional linkedin headshot, very friendly person, simple office background, ${prompt}` });
  return response.generatedImages[0].image.imageBytes;
};

export const generateBannerPhoto = async (industry: string, style: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: `LinkedIn banner, ${industry}, simple and clean design, ${style}`, config: { aspectRatio: '3:1' } });
  return response.generatedImages[0].image.imageBytes;
};

export const editProfilePhoto = async (data: string, mime: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ inlineData: { data, mimeType: mime } }, { text: `Please make this photo better: ${prompt}. Keep it simple and professional.` }] } });
  for (const p of response.candidates[0].content.parts) if (p.inlineData) return p.inlineData.data;
  throw new Error();
};

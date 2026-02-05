
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

// --- Rate Limiting & Error Handling ---

class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private activeRequests = 0;
  private maxConcurrent = 3;

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) return;

    this.activeRequests++;
    const task = this.queue.shift();

    if (task) {
      try {
        await task();
      } finally {
        this.activeRequests--;
        this.processNext();
      }
    }
  }
}

const requestQueue = new RequestQueue();

const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    // Check for 429 (Too Many Requests) or 503 (Service Unavailable)
    const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));
    const isServerOverload = error.status === 503 || (error.message && error.message.includes('503'));

    if (retries > 0 && (isRateLimit || isServerOverload)) {
      console.warn(`API Error ${error.status || 'unknown'}. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Wrapper to execute API calls safely with queuing and retry logic.
 */
const executeSafe = async <T>(operation: () => Promise<T>): Promise<T> => {
  return requestQueue.add(() => retryWithBackoff(operation));
};

// --- End Rate Limiting & Error Handling ---

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
    const response = await executeSafe(() => ai.models.generateContent({ model: FAST_MODEL, contents: prompt }));
    return response.text || text;
  } catch (error) { throw new Error("Translation failed."); }
};

export const generateLinkedInPosts = async (inputType: InputType, inputText: string, persona: Persona, wordCount: number, tone: string = 'Professional'): Promise<GeneratedContent> => {
  const ai = getAIClient();
  const prompt = `Help me write 3 simple LinkedIn posts for a ${persona}. INPUT: "${inputText}" TONE: ${tone}. Use about ${wordCount} words. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};


const MASTER_RESUME_PROMPT = `
🧠 1️⃣ MASTER RESUME PROMPT (UPGRADED)
You are an elite executive resume strategist.
Your job is NOT to summarize a career.
Your job is to POSITION this person as the best candidate for a specific target role.

Before writing, identify the TARGET JOB TITLE and optimize ALL content toward that role.

WRITING RULES:
- Every bullet must show impact, results, or improvement
- Use metrics whenever possible (%, $, time saved, growth, scale)
- Replace responsibilities with achievements
- Remove unrelated experience that does not support the target role
- Use strong action verbs
- Keep tone confident and professional
- Make the resume ATS-optimized using relevant keywords

STRUCTURE:
1. Professional Summary (3–4 lines focused on value and specialization)
2. Core Competencies (keywords aligned with target job)
3. Experience (achievement-based bullets only)
4. Education
5. Certifications/Tools (only relevant ones)

If metrics are missing, suggest realistic performance indicators.
`;

const LINKEDIN_HEADLINE_PROMPT = `
🧲 3️⃣ LINKEDIN HEADLINE GENERATOR (HIGH-CONVERSION)
Write 5 powerful LinkedIn headlines for a professional targeting the role.
The headline must:
- Clearly state who they help or what they specialize in
- Include role-specific keywords
- Show value or outcome
- Sound confident, not desperate
Avoid vague phrases like "seeking opportunities" or "open to work".
`;

const LINKEDIN_ABOUT_PROMPT = `
🔗 4️⃣ LINKEDIN “ABOUT” SECTION (CLIENT-CONVERTING)
Rewrite this LinkedIn About section to position the person as a top candidate for the target role.
Structure:
1. Opening hook about their professional value
2. What problems they solve
3. Key strengths and achievements
4. Types of roles or companies they fit best
5. Confident closing line
Tone: Professional, clear, confident, human
Avoid fluff and generic motivational lines
`;

const COVER_LETTER_PROMPT = `
✉️ 5️⃣ SMART COVER LETTER PROMPT (CRITICAL UPGRADE)
Write a tailored cover letter for a job application.
You MUST use:
- The company name (if available in Job Description)
- The job title
- Key requirements from the job description
- The candidate's real experience
Show how the candidate’s background directly matches the employer’s needs.
Tone: Professional, confident, specific
Length: 200–300 words
Avoid generic phrases and overused openings.
`;

const JOB_KEYWORDS_PROMPT = `
🎯 6️⃣ JOB KEYWORD EXTRACTION PROMPT
Analyze the job description and extract:
1. Top hard skills required
2. Top soft skills mentioned
3. Frequently repeated keywords
4. Tools, platforms, or certifications requested
Format as a list that can be inserted into a resume for ATS optimization.
`;

const INTERVIEW_ANSWER_PROMPT = `
🧩 7️⃣ INTERVIEW ANSWER GENERATOR (BONUS FEATURE)
Write a strong, confident answer to the interview question: "Tell me about yourself"
The answer should:
- Be tailored to the target job title
- Summarize career highlights
- Show specialization and strengths
- Be under 90 seconds when spoken
`;

export const generateApplicationAssets = async (jobDescription: string, resumeInfo: string, userEmail: string, template: ProfileTemplate = 'modern', atsCompliance: boolean = false, targetJobTitle: string = ''): Promise<ApplicationAssets> => {
  const ai = getAIClient();

  const prompt = `
    TASK: Generate a complete career application package.
    
    TARGET JOB TITLE: ${targetJobTitle || "Professional Role"}
    
    CLIENT EXPERIENCE:
    ${resumeInfo}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    INSTRUCTIONS:
    Execute the following prompts based on the provided inputs:
    
    ${MASTER_RESUME_PROMPT}
    
    ${LINKEDIN_HEADLINE_PROMPT}
    
    ${LINKEDIN_ABOUT_PROMPT}
    
    ${COVER_LETTER_PROMPT}
    
    ${JOB_KEYWORDS_PROMPT}
    
    ${INTERVIEW_ANSWER_PROMPT}

    ${ROI_PROMPT_TEMPLATE}
  `;

  const response = await executeSafe(() => ai.models.generateContent({
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
          linkedInHeadline: { type: Type.STRING },
          linkedInAbout: { type: Type.STRING },
          jobKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          interviewAnswer: { type: Type.STRING },
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
        required: ['coverLetter', 'resume', 'linkedInHeadline', 'linkedInAbout', 'jobKeywords', 'interviewAnswer', 'roiAnalysis']
      }
    }
  }));
  return JSON.parse(response.text.trim());
};


export const generateInterviewGuide = async (jobDetails: string, companyName?: string): Promise<InterviewPrepAssets> => {
  const ai = getAIClient();
  const prompt = `Let's help someone get ready for an interview at ${companyName || 'this company'}. JOB DETAILS: "${jobDetails}" ${READABILITY_GUIDELINES} ${ROI_PROMPT_TEMPLATE}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const searchLiveJobs = async (profileSummary: string, location: string): Promise<JobSearchResult> => {
  const ai = getAIClient();
  const prompt = `Please find 5 active jobs for someone who says: "${profileSummary}" in "${location}". Give them some simple advice too. ${ROI_PROMPT_TEMPLATE} ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const generateTrendingPosts = async (topic: string, persona: Persona): Promise<TrendingPostResult> => {
  const ai = getAIClient();
  const prompt = `Find 3 fun news items about "${topic}" and let's write simple posts for a ${persona}. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const optimizeLinkedInProfile = async (profile: any, goal: string): Promise<OptimizedProfile> => {
  const ai = getAIClient();
  const prompt = `Let's make this LinkedIn profile look great. GOAL: ${goal}. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const generateCaseStudy = async (problem: string, solution: string, result: string): Promise<CaseStudyAssets> => {
  const ai = getAIClient();
  const prompt = `Turn this win into a short, simple story: ${problem}, ${solution}, ${result}. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const fetchOptimizedJobDescription = async (role: string, industry: string): Promise<JobDescriptionAssets> => {
  const ai = getAIClient();
  const prompt = `Write a simple job description for a "${role}" in "${industry}". ${READABILITY_GUIDELINES} ${ROI_PROMPT_TEMPLATE}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const generateJobPost = async (jt: string, cn: string, desc: string, loc: string, et: string, ad: string, hm: string): Promise<JobPostAssets> => {
  const ai = getAIClient();
  const prompt = `Write a friendly hiring post for a ${jt} at ${cn}. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const generateNetworkingMessage = async (recipientRole: string, context: string, goal: string) => {
  const ai = getAIClient();
  const prompt = `Write two short, friendly messages for a ${recipientRole}. Goal: ${goal}. Context: ${context}. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const generateNewProfile = async (type: string, data: any) => {
  const ai = getAIClient();
  const prompt = `Build a new simple ${type} profile. ${READABILITY_GUIDELINES}`;
  const response = await executeSafe(() => ai.models.generateContent({
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
  }));
  return JSON.parse(response.text.trim());
};

export const generateProfilePhoto = async (prompt: string) => {
  const ai = getAIClient();
  const response = await executeSafe(() => ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: `professional linkedin headshot, very friendly person, simple office background, ${prompt}` }));
  return response.generatedImages[0].image.imageBytes;
};

export const generateBannerPhoto = async (industry: string, style: string) => {
  const ai = getAIClient();
  const response = await executeSafe(() => ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: `LinkedIn banner, ${industry}, simple and clean design, ${style}`, config: { aspectRatio: '3:1' } }));
  return response.generatedImages[0].image.imageBytes;
};

export const editProfilePhoto = async (data: string, mime: string, prompt: string) => {
  const ai = getAIClient();
  const response = await executeSafe(() => ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ inlineData: { data, mimeType: mime } }, { text: `Please make this photo better: ${prompt}. Keep it simple and professional.` }] } }));
  for (const p of response.candidates[0].content.parts) if (p.inlineData) return p.inlineData.data;
  throw new Error();
};

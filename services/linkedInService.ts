import { GoogleGenAI, Type } from '@google/genai';
import { LinkedInImportResult, LinkedInProfileData } from '../types';

/**
 * Validates if a URL is a valid LinkedIn profile URL
 */
const isValidLinkedInUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('linkedin.com') &&
            (urlObj.pathname.includes('/in/') || urlObj.pathname.includes('/pub/'));
    } catch {
        return false;
    }
};

/**
 * Extracts LinkedIn profile data using Gemini's grounding/search capabilities
 */
export const extractLinkedInProfile = async (url: string): Promise<LinkedInImportResult> => {
    // Validate URL
    if (!isValidLinkedInUrl(url)) {
        return {
            success: false,
            error: 'Invalid LinkedIn URL. Please provide a valid LinkedIn profile URL (e.g., linkedin.com/in/username)',
        };
    }

    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const genAI = new GoogleGenAI({ apiKey });

        const prompt = `You are analyzing a LinkedIn profile URL: ${url}

Please extract the following information from this public LinkedIn profile and return it as valid JSON.

Important:
- Only extract information that is publicly visible
- If a section is not available, use an empty string ""
- Be comprehensive - include all available details from each section`;

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        about: { type: Type.STRING },
                        education: { type: Type.STRING },
                        skills: { type: Type.STRING },
                    },
                    required: ['headline', 'about', 'education', 'skills']
                }
            }
        });

        const text = response.text.trim();

        // Parse the JSON response
        const data = JSON.parse(text) as LinkedInProfileData;

        // Validate that we got meaningful data
        if (!data.headline && !data.about) {
            return {
                success: false,
                error: 'Could not extract profile information. The profile might be private or the URL is incorrect.',
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('LinkedIn extraction error:', error);
        return {
            success: false,
            error: 'Failed to extract profile data. Please ensure the profile is public and try again.',
        };
    }
};

import { GoogleGenAI, Type } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from './supabase';
import toast from 'react-hot-toast';

// Map generic worker so Vite doesn't complain about local threading limits
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// We utilize the standard VITE env variable passed into the instance
// Initialized dynamically so the app won't crash on load if API key is not mapped yet!
const getAIClient = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("VITE_GEMINI_API_KEY is missing from your .env.local file. Please check settings.");
    return new GoogleGenAI({ apiKey: key });
};

const MODEL = 'gemini-flash-latest';

/**
 * Universal safe generation wrapper masking JSON errors natively with Exponential Backoff Retries.
 */
async function generateSafeContent(prompt, responseSchema, maxRetries = 3, baseDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await getAIClient().models.generateContent({
                model: MODEL,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });
            toast.dismiss('gemini-retry'); // Clear retry toast on success if present
            return JSON.parse(response.text);
        } catch (err) {
            console.error(`Gemini Logic Failure (Attempt ${attempt}/${maxRetries}):`, err);
            
            const isRateLimit = err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('429');
            
            if (isRateLimit && attempt < maxRetries) {
                toast('Gemini AI is temporarily busy. Retrying automatically...', { icon: '⏳', id: 'gemini-retry' });
                
                // Exponential backoff with dynamic detection mapping
                let waitTime = baseDelay * Math.pow(2, attempt - 1);
                
                // Attempt to natively extract the literal delay parameter provided by Google SDK (e.g., "retry in 8.04s")
                const match = err?.message?.match(/retry in ([\d.]+)s/i);
                if (match && match[1]) {
                    const dynamicDelay = parseFloat(match[1]) * 1000;
                    // Provide a 1-second overhead buffer to standard API delays ensuring the limiter definitively clears
                    waitTime = Math.max(dynamicDelay + 1000, waitTime);
                }
                
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue; // Trigger the next loop gracefully
            }
            
            toast.dismiss('gemini-retry');
            throw new Error(isRateLimit 
                ? "The AI service is temporarily busy. Please try again in a few moments." 
                : "We couldn't generate this request right now. Please try again later.");
        }
    }
}

/**
 * Helper: Shred Supabase PDF into Raw Text
 */
export async function extractPdfText(fileUrl) {
  try {
    // 1. Extract exactly the relative filePath from the public URL.
    const pathParts = fileUrl.split('/public/resumes/');
    if (pathParts.length !== 2) throw new Error("Invalid storage URL architecture");
    const filePath = pathParts[1];

    // 2. Safely download via Supabase SDK to bypass strict CORS blocks globally
    const { data, error } = await supabase.storage.from('resumes').download(filePath);
    if (error) throw error;
    
    // 3. Convert blob payload to ArrayBuffer for local native parsing
    const arrayBuffer = await data.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(" ") + "\n";
    }
    return text.trim();
  } catch (err) {
    console.error("PDF Engine Decoding Error:", err);
    throw new Error("We couldn't process your resume file. Please ensure it's a valid PDF.");
  }
}

/**
 * 1. Resume Analytics
 */
export async function generateResumeAnalysis(resumeText, jobDescriptionText) {
    const prompt = `Analyze this resume against the following job description (if provided). 
    Extract the core strengths and distinct weaknesses/areas to improve.
    Return strictly JSON matching this schema.

    Resume: ${resumeText}
    Target Job: ${jobDescriptionText || 'General Career Analysis - no specific job provided'}`;

    return generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["strengths", "weaknesses"]
    });
}

/**
 * 2. ATS Score
 */
export async function generateAtsScore(resumeText, jobDescriptionText) {
    const prompt = `Act as a strict Applicant Tracking System (ATS). 
    Compare the resume's exact terminology and structural alignment to the job requirements.
    Calculate an integer match score out of 100.
    Extract the specifically matching keywords found in both.
    Extract the highly desired keywords present in the job description but MISSING from the resume.

    Resume: ${resumeText}
    Job: ${jobDescriptionText}`;

    return generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            matching_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            missing_keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "matching_keywords", "missing_keywords"]
    });
}

/**
 * 3. Skill Gap
 */
export async function generateSkillGap(resumeText, jobDescriptionText) {
    const prompt = `Contrast the resume against the target job. Identify explicitly missing hard architectural/technical skills and missing soft interpersonal skills.
    Then, fabricate a 3-step practical roadmap on exactly how this individual can quickly pick up these missing traits.
    For each step, include:
    - phase: Title of the step phase
    - task: Clear explanation of what to learn and do
    - project_idea: A hands-on practical project to build for a portfolio
    - estimated_time: Recommended timeline (e.g. "1-2 Weeks", "3-5 Days")
    - impact_level: Importance rating ("High Impact", "Critical Focus", or "Core Skill")

    Resume: ${resumeText}
    Job: ${jobDescriptionText}`;

    return generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            missing_technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            missing_soft: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmap: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: {
                        phase: { type: Type.STRING },
                        task: { type: Type.STRING },
                        project_idea: { type: Type.STRING },
                        estimated_time: { type: Type.STRING },
                        impact_level: { type: Type.STRING }
                    },
                    required: ["phase", "task"]
                } 
            }
        },
        required: ["missing_technical", "missing_soft", "roadmap"]
    });
}

/**
 * 4. Cover Letter
 */
export async function generateCoverLetter(resumeText, jobDescriptionText, applicantName, customRequirements = "") {
    const prompt = `Write a compelling, professional, modern SaaS-tier cover letter targeted towards this exact job position leveraging the historical experience proven in the resume. 
    It should sound human, punchy, explicitly noting impactful quantifiable achievements if they exist in the resume. Keep it under 350 words.
    ${customRequirements ? `\n\nCRITICAL USER PERSONALIZATION DIRECTIVES (Enforce these strictly):\n${customRequirements}\n` : ''}

    Return strictly JSON with 'content' mapping to the full string.

    Applicant Name: ${applicantName}
    Resume: ${resumeText}
    Job: ${jobDescriptionText}`;

    return generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            content: { type: Type.STRING }
        },
        required: ["content"]
    });
}

/**
 * 5. Interview Questions
 */
export async function generateInterviewQuestions(resumeText, jobDescriptionText) {
    const prompt = `You are a strict technical hiring manager. Based on this job description and this particular candidate's resume, generate exactly 10 highly relevant interview questions.
    Mix the questions as follows:
    - 4 Deep Technical & Domain-Specific Questions
    - 3 Behavioral (STAR method) Questions
    - 2 System Architecture & Problem-Solving Scenarios
    - 1 Team Collaboration & Leadership Question

    Resume: ${resumeText}
    Job: ${jobDescriptionText}`;

    const data = await generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["questions"]
    });
    return data.questions;
}

/**
 * 5.5 Interview Feedback
 */
export async function generateInterviewFeedback(question, answer, jobDescriptionText) {
    const prompt = `Evaluate the candidate's answer to the given interview question regarding this job description.
    Grade it strictly from 0 to 100 based on the STAR method, relevance, and clarity.
    Provide constructive textual feedback outlining exactly what was missing and how to improve.

    Job: ${jobDescriptionText}
    Question: ${question}
    Answer: ${answer}`;

    return generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
    });
}

/**
 * 6. Final Report
 */
export async function generateFinalReport(resumeText, jobDescriptionText) {
    const prompt = `Provide a conclusive executive summary (3-4 sentences) dictating whether this candidate is highly competitive, moderately aligned, or under-qualified for this explicit role. Include a holistic integer match score out of 100.

    Resume: ${resumeText}
    Job: ${jobDescriptionText}`;

    return generateSafeContent(prompt, {
        type: Type.OBJECT,
        properties: {
            overall_score: { type: Type.INTEGER },
            summary: { type: Type.STRING }
        },
        required: ["overall_score", "summary"]
    });
}

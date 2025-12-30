import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeField } from "../types";

// Global API Key provided by admin - Bundled for deployment fallback
const GLOBAL_API_KEY = "AIzaSyCBcWgJn5Zmute_tROkTQKJ38WesqlAUScv";

// Helper to get key: Check LocalStorage (override) -> Env Var -> Hardcoded Global Key
const getApiKey = () => {
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey && localKey.trim().length > 0) return localKey.trim();
  
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  
  return GLOBAL_API_KEY;
};

const createModel = (apiKey: string, modelName: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

const generateWithFallback = async (prompt: string) => {
  let apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key configuration missing");

  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
  let usedSystemKey = false;

  const tryModels = async (currentKey: string): Promise<any> => {
    let lastError;
    for (const modelName of modelsToTry) {
      try {
        const model = createModel(currentKey, modelName);
        const result = await model.generateContent(prompt);
        return result;
      } catch (error: any) {
        lastError = error;
        if (error.message?.includes('400') || error.message?.includes('403') || error.message?.includes('key') || error.message?.includes('API_KEY_INVALID')) {
           throw error;
        }
        console.warn(`Model ${modelName} failed, trying next...`);
      }
    }
    throw lastError;
  };

  try {
    return await tryModels(apiKey);
  } catch (error: any) {
    if (
      (error.message?.includes('400') || error.message?.includes('API_KEY_INVALID') || error.message?.includes('key') || error.message?.includes('403')) && 
      apiKey !== GLOBAL_API_KEY && 
      !usedSystemKey
    ) {
      console.log("Current key failed. Auto-switching to System Global Key...");
      usedSystemKey = true;
      return await tryModels(GLOBAL_API_KEY);
    }
    throw error;
  }
};

export const aiService = {
  testConnection: async () => {
    try {
      await generateWithFallback("Test connection");
      return true;
    } catch (error: any) {
      console.error("Gemini Connection Test Failed:", error);
      if (error.message?.includes('404')) {
        throw new Error("Model not found. Ensure 'Generative Language API' is enabled.");
      }
      if (error.message?.includes('400') || error.message?.includes('key')) {
         throw new Error("API Key Invalid. Please check Settings.");
      }
      throw error;
    }
  },

  generateSummary: async (jobTitle: string, skills: string[], experience: string, field: ResumeField) => {
    const prompt = `Write a professional, ATS-friendly resume summary for a ${jobTitle} in the field of ${field}. 
    Key skills: ${skills.join(', ')}. 
    Experience highlights: ${experience}. 
    Keep it under 50 words. Use strong action verbs.`;

    const result = await generateWithFallback(prompt);
    return result.response.text();
  },

  improveBullets: async (text: string, role: string, field: ResumeField) => {
    const prompt = `Rewrite the following resume bullet point to be more impactful, use action verbs, and quantify results if possible. 
    Role: ${role}. Field: ${field}.
    Original text: "${text}"
    Return only the improved text, no explanations.`;

    const result = await generateWithFallback(prompt);
    return result.response.text();
  },

  generateFromField: async (field: ResumeField) => {
    // Tailor the prompt based on the field
    let specificInstructions = "";
    if (field === 'Doctor') {
      specificInstructions = "Include clinical rotations, hospital experience, and medical certifications.";
    } else if (field === 'Teacher') {
      specificInstructions = "Include teaching experience, curriculum development, and classroom management.";
    } else if (field === 'Bank Employee') {
      specificInstructions = "Include financial analysis, risk management, and customer relationship management.";
    } else if (field === 'Student / Fresher') {
      specificInstructions = "Focus on education, internships, academic projects, and soft skills.";
    }

    const prompt = `Generate a sample resume JSON structure for a ${field} role. 
    ${specificInstructions}
    Include a professional summary, 2 sample experience entries (relevant to ${field}), 1 sample education entry, 2 sample projects (or certifications if more relevant), and a list of 5 relevant skills.
    
    Format as valid JSON matching this schema exactly:
    {
      "personalInfo": { "summary": "Professional summary here..." },
      "experience": [{ "company": "Example Org", "position": "Role Title", "startDate": "2020-01", "endDate": "2023-01", "current": false, "description": "• Bullet point 1\n• Bullet point 2" }],
      "education": [{ "institution": "University Name", "degree": "Degree Name", "fieldOfStudy": "Major", "startDate": "2016", "endDate": "2020" }],
      "projects": [{ "name": "Project/Cert Name", "description": "Description...", "technologies": "Tools used", "link": "https://example.com" }],
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
    }
    
    IMPORTANT: Return ONLY the raw JSON string. Do not include markdown formatting like \`\`\`json or \`\`\`.`;

    const result = await generateWithFallback(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  }
};

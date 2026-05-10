import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' });
  }
  return aiInstance;
}

export async function generateCaption(topic: string, mood: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite", // fast model
    contents: `Generate a viral TikTok caption about: ${topic}. Mood/Vibe: ${mood}. Include appropriate emojis and spacing. Keep it engaging. Just return the caption text.`,
  });
  return response.text?.trim() || "Failed to generate caption.";
}

export async function generateHashtags(category: string): Promise<string[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `Generate 15 viral TikTok hashtags for the category: ${category}. Return ONLY a JSON list of strings, e.g. ["#fyp", "#gaming", "#viral"]. Do not use markdown blocks.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  try {
    const data = JSON.parse(response.text?.trim() || "[]");
    return data;
  } catch(e) {
    return ["#fyp", "#viral", "#foryou"];
  }
}

export async function generateBio(keywords: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `Generate a stylish, aesthetic TikTok bio using these keywords: ${keywords}. It must be 1 to 4 lines maximum. Use creative formatting and emojis. Return ONLY the bio text.`,
  });
  return response.text?.trim() || "Failed to generate bio.";
}

export async function generateVideoIdea(niche: string): Promise<{title: string, hook: string, description: string}> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `Generate one viral TikTok video idea for the niche: ${niche}. Return ONLY valid JSON with keys: 'title', 'hook', 'description'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "hook", "description"]
      }
    }
  });
  try {
    const data = JSON.parse(response.text?.trim() || "{}");
    return data;
  } catch(e) {
    return { title: "Trend Alert", hook: "Wait until the end...", description: "React to the latest trend in your niche." };
  }
}

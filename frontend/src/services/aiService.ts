// Real-time AI Intelligence Service powered by Groq High-Speed LLM Inference

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';

export function getGroqApiKey(): string {
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
  return localStorage.getItem('sahayak_groq_key') || envKey || '';
}

export function setGroqApiKey(key: string): void {
  localStorage.setItem('sahayak_groq_key', key);
}

export async function queryGroqDisasterAI(prompt: string, contextData?: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return 'Please configure your Groq API Key in settings or .env to enable real-time AI copilot.';
  }
  const systemPrompt = `You are SAHAYAK AI, the premier disaster intelligence copilot for emergency managers, first responders (NDRF, SDRF), and citizens. 
Provide concise, tactical, and grounded intelligence. Use bullet points where appropriate. Always prioritize human life safety, clear evacuation directives, and precise hydrological/meteorological insights.
Current Live Context: ${contextData || 'Theater: Chamoli Basin, Uttarakhand. River discharge: 294 m³/s. Active Cloudburst Warning.'}`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 450,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API returned ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (err: any) {
    console.error('Groq AI error:', err);
    return `Error connecting to Groq AI: ${err.message}. Please verify network connection or API Key.`;
  }
}

export async function triageEmergencyMessageWithAI(msg: string): Promise<{
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  urgencyScore: number;
  category: string;
  recommendedAction: string;
}> {
  const apiKey = getGroqApiKey();
  const prompt = `Analyze this citizen disaster message and respond ONLY in valid JSON with keys "priority" ("CRITICAL", "HIGH", "MODERATE", "LOW"), "urgencyScore" (0.0 to 1.0), "category" (e.g. "Flood Inundation", "Medical Trauma", "Road Blockage"), and "recommendedAction" (concise 1-sentence dispatch directive).
Message: "${msg}"`;

  if (apiKey) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.1
        })
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.warn('Fallback triage heuristics:', e);
    }
  }

  // Fallback heuristic
  const isFlood = /flood|water|river|drown/i.test(msg);
  const isMedical = /injury|doctor|blood|trauma|heart/i.test(msg);
  return {
    priority: isFlood || isMedical ? 'CRITICAL' : 'HIGH',
    urgencyScore: isFlood || isMedical ? 0.92 : 0.78,
    category: isFlood ? 'Flood Inundation' : isMedical ? 'Medical Trauma' : 'General Relief Need',
    recommendedAction: isFlood ? 'Deploy NDRF Zodiac Inflatable Boat Unit' : 'Dispatch SDRF Mobile Paramedic Unit'
  };
}

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { DEMO_RESOURCES, DEMO_EQUIPMENT_REQUESTS } from './src/data/seedData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      catalogResourceCount: DEMO_RESOURCES.length,
    },
    message: 'ResourceLoop Server is healthy',
  });
});

// API: AI Smart Match & Alternative Recommender
app.post('/api/ai/match', async (req: Request, res: Response) => {
  const { query, filters } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUERY', message: 'Query string is required' },
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

  // Deterministic catalog search baseline
  const lowerQuery = query.toLowerCase();
  const queryTokens = lowerQuery.split(/\s+/).filter((t) => t.length > 2);

  const scoredResources = DEMO_RESOURCES.map((r) => {
    let score = 0;
    const searchable = `${r.name} ${r.category} ${r.description} ${r.specifications} ${r.location}`.toLowerCase();
    
    // Direct category match
    if (filters?.category && r.category.toLowerCase() === filters.category.toLowerCase()) {
      score += 30;
    }

    // Keyword matches
    queryTokens.forEach((token) => {
      if (searchable.includes(token)) score += 15;
    });

    // Budget constraint check
    if (filters?.maxBudget && r.rentalPricePerDay <= filters.maxBudget) {
      score += 10;
    }

    // Availability boost
    if (r.availability === 'available') {
      score += 10;
    } else if (r.availability === 'maintenance') {
      score -= 20;
    }

    return { resource: r, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // If Gemini API is available, enrich with AI reasoning & technical alternatives
  if (isKeyConfigured) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const candidateSummary = DEMO_RESOURCES.slice(0, 15).map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        rentalPricePerDay: r.rentalPricePerDay,
        availability: r.availability,
        condition: r.condition,
        trainingRequired: r.trainingRequired,
        specifications: r.specifications,
      }));

      const systemPrompt = `You are the ResourceLoop AI Matcher for an academic and engineering equipment sharing platform.
A user entered this equipment request: "${query}".
Filters applied: ${JSON.stringify(filters || {})}.

Available Resource Catalog:
${JSON.stringify(candidateSummary, null, 2)}

Your task:
1. Extract requirements: category, equipment, key specifications, budget (INR), duration in days, location preferences.
2. Recommend up to 3 top matching catalog resources with matchScore (0-100) and concise technical rationale.
3. If no exact catalog match is available or budget/specs are tight, suggest 1 or 2 technically sound alternatives or substitutions (for example, if someone needs a thermal camera to find overheating PCB components, suggest using a digital multimeter with a temperature probe or a logic analyser; if someone needs a high-end oscilloscope, suggest a logic analyser or USB scope).
4. Provide practical advice for student eligibility, training, or budget optimization.

Output strictly valid JSON matching this schema:
{
  "extractedRequirements": {
    "category": string,
    "equipment": string,
    "specifications": string,
    "budget": number,
    "durationDays": number,
    "location": string
  },
  "recommendations": [
    {
      "resourceId": string,
      "resourceName": string,
      "category": string,
      "rentalPricePerDay": number,
      "matchScore": number,
      "matchReason": string,
      "isAlternative": boolean,
      "alternativeExplanation": string
    }
  ],
  "advice": string
}`;

      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 5000)
      );

      const aiResponse: any = await Promise.race([aiPromise, timeoutPromise]);
      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        res.json({
          success: true,
          data: {
            query,
            extractedRequirements: parsed.extractedRequirements || {},
            recommendations: parsed.recommendations || [],
            advice: parsed.advice || 'Verified against institutional catalog records.',
            deterministicFallbackUsed: false,
          },
          message: 'AI equipment match completed via Gemini',
        });
        return;
      }
    } catch (aiError) {
      console.warn('Gemini API call failed or timed out. Falling back to deterministic matching:', aiError);
    }
  }

  // Deterministic fallback (guaranteed to always work)
  const topMatches = scoredResources.slice(0, 4);
  const fallbackRecommendations = topMatches.map(({ resource, score }, idx) => ({
    resourceId: resource.id,
    resourceName: resource.name,
    category: resource.category,
    rentalPricePerDay: resource.rentalPricePerDay,
    matchScore: Math.min(95, Math.max(50, score + 40 - idx * 10)),
    matchReason: `Matches equipment category "${resource.category}" and technical keywords in catalog. Current status: ${resource.availability}.`,
    isAlternative: idx > 1,
    alternativeExplanation: idx > 1 ? `Alternative instrument option in ${resource.category} with lower rental deposit.` : undefined,
  }));

  res.json({
    success: true,
    data: {
      query,
      extractedRequirements: {
        category: filters?.category || 'General Engineering',
        equipment: query,
        budget: filters?.maxBudget || 1000,
        location: filters?.location || 'Pune Consortium',
      },
      recommendations: fallbackRecommendations,
      advice: 'Matched using deterministic catalog filters. Check training requirements and institutional booking clearance before requesting.',
      deterministicFallbackUsed: true,
    },
    message: 'Catalog search completed (deterministic fallback)',
  });
});

// API: AI Summarize Incident
app.post('/api/ai/summarize-incident', async (req: Request, res: Response) => {
  const { description, incidentType } = req.body;
  if (!description) {
    res.status(400).json({ success: false, error: { message: 'Description is required' } });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Summarize this equipment incident report for lab technicians in 2 objective, neutral bullet points without assigning blame:
Incident Type: ${incidentType}
Description: ${description}`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({
        success: true,
        data: { summary: aiRes.text || '' },
      });
      return;
    } catch {
      // fallback
    }
  }

  res.json({
    success: true,
    data: { summary: `Reported as ${incidentType}: ${description.slice(0, 200)}...` },
  });
});

// API: Return Demo Catalog data for frontend hydration or verification
app.get('/api/catalog', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      resources: DEMO_RESOURCES,
      requests: DEMO_EQUIPMENT_REQUESTS,
    },
  });
});

// Full-Stack Server & Vite Integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Vite Dev Server Middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ResourceLoop full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

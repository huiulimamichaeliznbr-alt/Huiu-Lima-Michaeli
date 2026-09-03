import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Creative fallback themes if Gemini API is offline or quota exceeded
const PRESET_THEMES = [
  'Cyberpunk Neon Metropolis',
  'Aquarela Botânica Minimalista',
  'Anime Fantasia Vintage',
  'Futurismo Retro Synthwave',
  'Arquitetura Minimalista Japonesa',
  'Animais Místicos Cósmicos',
  'Paisagens da Natureza Dourada',
  'Pop Art 3D Isométrica',
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Expand a seed prompt into 50 diverse, vivid prompt variations
  app.post('/api/expand-prompts', async (req, res) => {
    try {
      const { prompt, style = 'Foto Realista', count = 50 } = req.body;
      const targetCount = Math.min(Math.max(Number(count) || 50, 1), 50);
      const cleanPrompt = (prompt || 'Paisagens cósmicas e futuristas').trim();

      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Você é um diretor de arte e engenheiro de prompts especialista.
Com base no tema: "${cleanPrompt}" e estilo: "${style}", gere uma lista com exatamente ${targetCount} variações detalhadas e únicas de prompts visuais em português ou inglês para geração de imagens.
Cada variação deve explorar ângulos, iluminação, composição, cores e elementos únicos.

Retorne em formato JSON válido contendo um array de objetos:
[
  {
    "id": 1,
    "title": "Título curto (2 a 4 palavras)",
    "prompt": "Descrição detalhada da cena com iluminação e atmosfera em inglês ou português",
    "category": "Categoria (ex: Arquitetura, Personagem, Paisagem, Conceito, Macro, Noturno)",
    "tags": ["tag1", "tag2", "tag3"],
    "mood": "Sentimento/Atmosfera (ex: Sereno, Épico, Cibernético, Misterioso)"
  }
]`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    category: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    mood: { type: Type.STRING },
                  },
                  required: ['id', 'title', 'prompt', 'category', 'tags', 'mood'],
                },
              },
            },
          });

          const parsed = JSON.parse(response.text || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Fill up to targetCount if fewer
            const finalPrompts = parsed.slice(0, targetCount);
            return res.json({ prompts: finalPrompts, source: 'gemini-3.8-flash' });
          }
        } catch (genError) {
          console.warn('Gemini prompt expansion fallback:', (genError as Error).message);
        }
      }

      // Procedural fallback if Gemini is not accessible or failed
      const fallbacks = generateFallbackPrompts(cleanPrompt, style, targetCount);
      return res.json({ prompts: fallbacks, source: 'smart-generator' });
    } catch (err) {
      console.error('Error in expand-prompts:', err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Single image generation with Gemini nano-banana (gemini-3.1-flash-lite-image)
  app.post('/api/generate-gemini-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '1:1' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt é obrigatório.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY não configurada. Use o modo ultra-rápido ou configure sua chave.',
          needsKey: true,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
          },
        },
      });

      let imageUrl: string | null = null;
      const candidates = response.candidates || [];
      if (candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: 'Não foi possível extrair a imagem gerada pela IA.',
        });
      }

      return res.json({ imageUrl, model: 'gemini-3.1-flash-lite-image' });
    } catch (err: any) {
      console.error('Gemini image generation error:', err);
      const isQuota = err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('429');
      res.status(err?.status || 500).json({
        error: err.message || 'Erro ao gerar imagem com Gemini.',
        isQuotaError: isQuota,
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Fallback generator that crafts 50 distinct, diverse prompts
function generateFallbackPrompts(basePrompt: string, style: string, count: number) {
  const angles = [
    'Plano fechado macro detalhado',
    'Vista panorâmica angular ampla',
    'Perspectiva isométrica 3D aérea',
    'Retrato cinematográfico dramático',
    'Ângulo holandês dinâmico',
    'Visão aérea de pássaro (top-down)',
    'Enquadramento simétrico centralizado',
    'Ponto de vista em primeira pessoa',
    'Composição minimalista regra dos terços',
    'Plano geral épico com horizonte',
  ];

  const lightings = [
    'Iluminação dourada de pôr do sol cinematográfico',
    'Luzes de neon bioluminescente e reflexos úmidos',
    'Luz solar suave de manhã com névoa volumétrica',
    'Iluminação de estúdio profissional com luz de recorte',
    'Luar prateado etéreo com céu estrelado cintilante',
    'Contraste dramático chiaroscuro com sombras profundas',
    'Iluminação pastel difusa de estúdio nórdico',
    'Raios crepusculares atravessando partículas atmosféricas',
    'Cores vibrantes de hora azul (blue hour)',
    'Brilho holográfico iridescente com reflexos prismáticos',
  ];

  const atmospheres = [
    'atmosfera misteriosa e envolvente',
    'energia vibrante e futurista',
    'serenidade pacífica e orgânica',
    'profundidade cinematográfica digna de tela de cinema',
    'estética retrô e nostálgica bem cuidada',
    'elegância moderna com linhas puras',
    'clima épico e monumental',
    'delicadeza artesanal e texturas táteis',
    'sensação onírica de sonho lúcido',
    'vibração cyberpunk de alta tecnologia',
  ];

  const categories = ['Arquitetura', 'Paisagem', 'Personagem', 'Conceitual', 'Macro', 'Noturno', 'Fantasia', 'Geométrico'];

  const results = [];
  for (let i = 1; i <= count; i++) {
    const angle = angles[(i - 1) % angles.length];
    const light = lightings[(i - 1) % lightings.length];
    const mood = atmospheres[(i - 1) % atmospheres.length];
    const category = categories[(i - 1) % categories.length];

    results.push({
      id: i,
      title: `${basePrompt.slice(0, 18)} #${i}`,
      prompt: `${basePrompt}, variação #${i} no estilo ${style}. ${angle}, ${light}, ${mood}. Alta resolução, detalhes nítidos e composição de destaque.`,
      category,
      tags: [style, category, `Variação ${i}`],
      mood: mood.split(' ')[0].replace(/^./, (str) => str.toUpperCase()),
    });
  }

  return results;
}

startServer();

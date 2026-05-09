import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    manchete: {
      type: Type.STRING,
      description: "Título chamativo e otimizado para SEO.",
    },
    subtitulo: {
      type: Type.STRING,
      description: "Subtítulo explicativo que complementa o título.",
    },
    lead: {
      type: Type.STRING,
      description: "Primeiro parágrafo jornalístico resumindo o fato principal (o quê, quem, quando, onde, por quê).",
    },
    corpo: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "O desenvolvimento da notícia dividido em parágrafos.",
    },
    contexto: {
      type: Type.STRING,
      description: "Contexto histórico ou impacto atual da notícia.",
    },
    desdobramento: {
      type: Type.STRING,
      description: "Possível desdobramento futuro ou o que esperar a seguir.",
    },
  },
  required: ["manchete", "subtitulo", "lead", "corpo", "contexto", "desdobramento"],
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Generate news endpoint
app.post('/api/generate-news', async (req, res) => {
  try {
    const { category, facts, files = [] } = req.body;

    if (!facts || facts.trim().length < 10) {
      return res.status(400).json({
        error: 'Fatos insuficientes. Mínimo 10 caracteres.',
      });
    }

    const systemInstruction = `
      Você é um jornalista profissional e redator digital especializado em notícias atuais.
      
      TEMA/CATEGORIA: ${category}
      
      TAREFA:
      Crie uma notícia ORIGINAL, clara e informativa, com linguagem jornalística neutra e confiável.
      Analise os FATOS fornecidos em texto e, se houver arquivos anexados, extraia informações relevantes deles.
      
      REGRAS:
      - Linguagem clara e objetiva
      - Sem opinião pessoal
      - Português do Brasil
      - Conteúdo 100% original
      - Estilo portal de notícias moderno
    `;

    const parts = [
      {
        text: `INFORMAÇÕES BASE (TEXTO):\n${facts}\n\nUtilize também o conteúdo visual ou textual dos arquivos anexados abaixo para enriquecer a notícia.`,
      },
    ];

    // Add files as inline data
    files.forEach((file) => {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: newsSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Resposta vazia da IA.');
    }

    const newsData = JSON.parse(text);
    res.json({ success: true, news: newsData });
  } catch (error) {
    console.error('Erro ao gerar notícia:', error);
    res.status(500).json({
      error: 'Falha ao gerar a notícia. Verifique sua conexão ou tente novamente.',
      details: error.message,
    });
  }
});

// Optimize headline endpoint
app.post('/api/optimize-headline', async (req, res) => {
  try {
    const { currentHeadline, subtitle, lead, category } = req.body;

    const prompt = `
      Você é um especialista em SEO e Copywriting para jornalismo digital.
      
      CONTEXTO DA NOTÍCIA:
      Categoria: ${category}
      Manchete Atual: "${currentHeadline}"
      Subtítulo: "${subtitle}"
      Lead: "${lead}"
      
      TAREFA:
      Reescreva a manchete atual para torná-la MUITO mais chamativa, impactante e otimizada para SEO (cliques e busca).
      Mantenha o tom jornalístico, mas aumente a curiosidade ou a urgência.
      Não use clickbait enganoso, apenas torne o fato mais atraente.
      A nova manchete deve ser diferente da atual.
      
      RETORNE APENAS UM JSON com a propriedade "newHeadline".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newHeadline: {
              type: Type.STRING,
              description: 'A manchete otimizada e chamativa.',
            },
          },
          required: ['newHeadline'],
        },
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Resposta vazia da IA.');
    }

    const result = JSON.parse(text);
    res.json({ success: true, newHeadline: result.newHeadline });
  } catch (error) {
    console.error('Erro ao otimizar manchete:', error);
    res.status(500).json({
      error: 'Falha ao otimizar a manchete.',
      details: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
  console.log(`Endpoint: POST http://localhost:${port}/api/generate-news`);
});

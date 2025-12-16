import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedNews, NewsCategory, StoredFile } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const newsSchema: Schema = {
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

const headlineSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    newHeadline: {
      type: Type.STRING,
      description: "A manchete otimizada e chamativa.",
    },
  },
  required: ["newHeadline"],
};

export const generateNewsArticle = async (
  category: NewsCategory,
  facts: string,
  files: StoredFile[] = []
): Promise<GeneratedNews> => {
  
  const systemInstruction = `
    Você é um jornalista profissional e redator digital especializado em notícias atuais.
    
    TEMA/CATEGORIA: ${category}
    
    TAREFA:
    Crie uma notícia ORIGINAL, clara e informativa, com linguagem jornalística neutra e confiável.
    Analise os FATOS fornecidos em texto e, se houver arquivos anexados (Imagens ou PDFs), extraia informações relevantes deles para compor a matéria.
    
    REGRAS:
    - Linguagem clara e objetiva
    - Sem opinião pessoal
    - Português do Brasil
    - Conteúdo 100% original
    - Estilo portal de notícias moderno
    - Não mencionar fontes ('segundo fontes', 'informou o g1') diretamente no texto, narre os fatos.
  `;

  // Construct parts: Text Prompt + Images/PDFs
  const parts: any[] = [
    { text: `INFORMAÇÕES BASE (TEXTO):\n${facts}\n\nUtilize também o conteúdo visual ou textual dos arquivos anexados abaixo para enriquecer a notícia.` }
  ];

  // Add files as inline data
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: newsSchema,
        temperature: 0.7, 
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Resposta vazia da IA.");
    }
    
    return JSON.parse(text) as GeneratedNews;

  } catch (error) {
    console.error("Erro ao gerar notícia:", error);
    throw new Error("Falha ao gerar a notícia. Verifique sua conexão ou tente novamente.");
  }
};

export const optimizeHeadline = async (
  currentHeadline: string,
  subtitle: string,
  lead: string,
  category: string
): Promise<string> => {
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: headlineSchema,
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia da IA.");
    }
    
    const json = JSON.parse(text);
    return json.newHeadline;

  } catch (error) {
    console.error("Erro ao otimizar manchete:", error);
    throw new Error("Falha ao otimizar a manchete.");
  }
};
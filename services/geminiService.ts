import { GeneratedNews, NewsCategory, StoredFile } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const generateNewsArticle = async (
  category: NewsCategory,
  facts: string,
  files: StoredFile[] = []
): Promise<GeneratedNews> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        facts,
        files,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao gerar notícia');
    }

    const data = await response.json();
    return data.news as GeneratedNews;
  } catch (error) {
    console.error("Erro ao gerar notícia:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Falha ao gerar a notícia. Verifique sua conexão ou tente novamente."
    );
  }
};

export const optimizeHeadline = async (
  currentHeadline: string,
  subtitle: string,
  lead: string,
  category: string
): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/optimize-headline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentHeadline,
        subtitle,
        lead,
        category,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao otimizar manchete');
    }

    const data = await response.json();
    return data.newHeadline as string;
  } catch (error) {
    console.error("Erro ao otimizar manchete:", error);
    throw new Error("Falha ao otimizar a manchete.");
  }
};
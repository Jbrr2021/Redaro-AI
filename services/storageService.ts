import { SavedNewsItem } from "../types";

const STORAGE_KEY = 'REDATOR_AI_SAVED_NEWS';

export const getSavedNews = (): SavedNewsItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao carregar notícias salvas:", error);
    return [];
  }
};

export const saveNewsToStorage = (newsItem: SavedNewsItem): void => {
  try {
    const currentList = getSavedNews();
    // Avoid duplicates by ID if updating, or just prepend
    const updatedList = [newsItem, ...currentList.filter(item => item.id !== newsItem.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error("Erro ao salvar notícia:", error);
    alert("Não foi possível salvar a notícia. O armazenamento local pode estar cheio.");
  }
};

export const deleteNewsFromStorage = (id: string): SavedNewsItem[] => {
  try {
    const currentList = getSavedNews();
    const updatedList = currentList.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    return [];
  }
};
export enum NewsCategory {
  BRASIL = 'Brasil',
  MUNDO = 'Mundo',
  POLITICA = 'Política',
  ECONOMIA = 'Economia',
  TECNOLOGIA = 'Tecnologia',
  ESPORTE = 'Esporte',
  ENTRETENIMENTO = 'Entretenimento'
}

export interface GeneratedNews {
  manchete: string;
  subtitulo: string;
  lead: string;
  corpo: string[];
  contexto: string;
  desdobramento: string;
  imageUrl?: string;
  author?: string;
}

export interface SavedNewsItem extends GeneratedNews {
  id: string;
  savedAt: string; // ISO Date string
  category: NewsCategory;
}

export interface StoredFile {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  mimeType: string;
  data: string; // Base64 content
  size: number;
  uploadDate: Date;
}

export type ViewState = 'dashboard' | 'files' | 'history' | 'settings';
import React from 'react';
import { SavedNewsItem } from '../types';
import { Calendar, Trash2, ArrowRight, BookOpen } from 'lucide-react';

interface HistoryPageProps {
  items: SavedNewsItem[];
  onSelect: (item: SavedNewsItem) => void;
  onDelete: (id: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ items, onSelect, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 animate-fade-in-up">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Seu histórico está vazio</h3>
        <p className="text-gray-500 mt-2">As notícias que você salvar aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Histórico de Notícias</h2>
        <p className="text-gray-600 mt-2">Acesse e gerencie suas pautas geradas anteriormente.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-2 py-1 text-[10px] font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
                  {item.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.savedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 font-serif leading-tight mb-2 line-clamp-3">
                {item.manchete}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                {item.lead}
              </p>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onSelect(item)}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Ler Notícia <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
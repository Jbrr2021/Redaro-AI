import React, { useState } from 'react';
import { NewsCategory, StoredFile } from '../types';
import { Send, FileText, Loader2, Paperclip, Check, X } from 'lucide-react';

interface NewsFormProps {
  onSubmit: (category: NewsCategory, facts: string, files: StoredFile[], author: string) => void;
  isLoading: boolean;
  availableFiles: StoredFile[];
}

const NewsForm: React.FC<NewsFormProps> = ({ onSubmit, isLoading, availableFiles }) => {
  const [category, setCategory] = useState<NewsCategory>(NewsCategory.BRASIL);
  const [facts, setFacts] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [showFileSelector, setShowFileSelector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (facts.trim().length < 10) {
        alert("Por favor, insira mais detalhes sobre o fato para gerar uma boa notícia.");
        return;
    }
    
    // Get actual file objects
    const selectedFiles = availableFiles.filter(f => selectedFileIds.has(f.id));
    
    onSubmit(category, facts, selectedFiles, author);
  };

  const toggleFile = (id: string) => {
    const newSet = new Set(selectedFileIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedFileIds(newSet);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6 text-indigo-700">
        <FileText className="w-6 h-6" />
        <h2 className="text-xl font-bold font-sans">Painel de Redação</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Editoria / Tema
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsCategory)}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm appearance-none"
                  disabled={isLoading}
                >
                  {Object.values(NewsCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Autor / Jornalista (Opcional)
              </label>
              <input
                id="author"
                type="text"
                className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Seu nome ou Redação"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isLoading}
              />
            </div>
        </div>

        <div>
          <label htmlFor="facts" className="block text-sm font-medium text-gray-700 mb-2">
            Fatos e Informações Brutas
          </label>
          <textarea
            id="facts"
            rows={6}
            className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
            placeholder="Cole aqui os dados, acontecimentos, declarações ou tópicos principais..."
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Attachments Section */}
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    Anexar Arquivos (Opcional)
                </label>
                {availableFiles.length > 0 && (
                     <button 
                        type="button" 
                        onClick={() => setShowFileSelector(!showFileSelector)}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                     >
                        <Paperclip className="w-3 h-3" />
                        {showFileSelector ? 'Ocultar arquivos' : 'Selecionar da biblioteca'}
                     </button>
                )}
            </div>
            
            {availableFiles.length === 0 ? (
                <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                    Nenhum arquivo disponível. Vá para a aba "Arquivos" para fazer upload de PDFs ou Imagens.
                </div>
            ) : (
                <>
                     {/* Selected Preview chips */}
                     {selectedFileIds.size > 0 && !showFileSelector && (
                         <div className="flex flex-wrap gap-2 mb-2">
                            {availableFiles.filter(f => selectedFileIds.has(f.id)).map(f => (
                                <span key={f.id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">
                                    <FileText className="w-3 h-3" />
                                    {f.name.substring(0, 15)}{f.name.length > 15 ? '...' : ''}
                                    <button type="button" onClick={() => toggleFile(f.id)} className="ml-1 hover:text-indigo-900"><X className="w-3 h-3"/></button>
                                </span>
                            ))}
                         </div>
                     )}

                     {/* Selection List */}
                     {showFileSelector && (
                         <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-gray-50">
                             {availableFiles.map(file => {
                                 const isSelected = selectedFileIds.has(file.id);
                                 return (
                                     <div 
                                        key={file.id} 
                                        onClick={() => toggleFile(file.id)}
                                        className={`p-2 flex items-center justify-between cursor-pointer hover:bg-white transition-colors text-sm ${isSelected ? 'bg-indigo-50' : ''}`}
                                     >
                                         <div className="flex items-center gap-2 overflow-hidden">
                                             <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                             <span className={`truncate ${isSelected ? 'text-indigo-700 font-medium' : 'text-gray-600'}`}>{file.name}</span>
                                         </div>
                                         {isSelected && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                                     </div>
                                 )
                             })}
                         </div>
                     )}
                </>
            )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !facts.trim()}
          className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors
            ${isLoading || !facts.trim() 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redigindo com IA...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Gerar Notícia {selectedFileIds.size > 0 && `(+ ${selectedFileIds.size} anexos)`}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewsForm;
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NewsForm from './components/NewsForm';
import NewsDisplay from './components/NewsDisplay';
import FilesPage from './components/FilesPage';
import HistoryPage from './components/HistoryPage';
import { generateNewsArticle } from './services/geminiService';
import { getSavedNews, saveNewsToStorage, deleteNewsFromStorage } from './services/storageService';
import { GeneratedNews, NewsCategory, StoredFile, ViewState, SavedNewsItem } from './types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [files, setFiles] = useState<StoredFile[]>([]);
  
  // Dashboard State
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>(NewsCategory.BRASIL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History State
  const [savedNews, setSavedNews] = useState<SavedNewsItem[]>([]);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    setSavedNews(getSavedNews());
  }, []);

  const handleGenerateNews = async (category: NewsCategory, facts: string, attachedFiles: StoredFile[], author: string) => {
    setLoading(true);
    setError(null);
    setGeneratedNews(null);
    setCurrentSavedId(null);
    setSelectedCategory(category);

    try {
      const news = await generateNewsArticle(category, facts, attachedFiles);
      
      // Inject the first image from attached files as the hero image for the news
      const heroImage = attachedFiles.find(f => f.type === 'image');
      if (heroImage) {
        news.imageUrl = `data:${heroImage.mimeType};base64,${heroImage.data}`;
      }

      // Inject the author name
      news.author = author || 'Redação Digital';

      setGeneratedNews(news);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  const handleHeadlineUpdate = (newHeadline: string) => {
    if (generatedNews) {
      setGeneratedNews({
        ...generatedNews,
        manchete: newHeadline
      });
    }
  };

  const handleReset = () => {
    setGeneratedNews(null);
    setError(null);
    setCurrentSavedId(null);
  };

  const handleAddFile = (file: StoredFile) => {
    setFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveNews = () => {
    if (!generatedNews) return;

    const newItem: SavedNewsItem = {
      ...generatedNews,
      id: Math.random().toString(36).substring(7),
      savedAt: new Date().toISOString(),
      category: selectedCategory
    };

    saveNewsToStorage(newItem);
    setSavedNews(prev => [newItem, ...prev]);
    setCurrentSavedId(newItem.id);
  };

  const handleDeleteSavedNews = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta notícia do histórico?')) {
      const updated = deleteNewsFromStorage(id);
      setSavedNews(updated);
    }
  };

  const handleSelectHistoryItem = (item: SavedNewsItem) => {
    setGeneratedNews(item);
    setSelectedCategory(item.category);
    setCurrentSavedId(item.id);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* FILES PAGE VIEW */}
          {currentView === 'files' && (
             <FilesPage 
                files={files} 
                onAddFile={handleAddFile} 
                onRemoveFile={handleRemoveFile}
             />
          )}

          {/* HISTORY PAGE VIEW */}
          {currentView === 'history' && (
            <HistoryPage 
              items={savedNews}
              onSelect={handleSelectHistoryItem}
              onDelete={handleDeleteSavedNews}
            />
          )}

          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <>
                <div className="mb-8 text-center md:text-left">
                    {!generatedNews ? (
                        <>
                            <h2 className="text-3xl font-bold text-gray-900">Sala de Redação</h2>
                            <p className="mt-2 text-gray-600">Transforme fatos em notícias profissionais em segundos usando IA.</p>
                        </>
                    ) : (
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> Voltar para o Painel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Form */}
                    {!generatedNews && (
                        <div className="lg:col-span-8 lg:col-start-3">
                            <NewsForm 
                                onSubmit={handleGenerateNews} 
                                isLoading={loading} 
                                availableFiles={files}
                            />
                            
                            <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm text-gray-500">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <strong className="block text-gray-700 mb-1">Seja Específico</strong>
                                    Forneça nomes e dados exatos.
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <strong className="block text-gray-700 mb-1">Use Arquivos</strong>
                                    Vá em "Arquivos" para subir PDFs e Imagens.
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <strong className="block text-gray-700 mb-1">Revisão Humana</strong>
                                    Sempre revise o conteúdo final.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                    <div className="lg:col-span-8 lg:col-start-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Erro na geração</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button onClick={() => setError(null)} className="text-xs text-red-600 underline mt-2 hover:text-red-800">Tentar novamente</button>
                        </div>
                    </div>
                    )}

                    {/* Result Display */}
                    {generatedNews && (
                    <div className="lg:col-span-12 animate-fade-in-up">
                        <NewsDisplay 
                        news={generatedNews} 
                        category={selectedCategory} 
                        onUpdateHeadline={handleHeadlineUpdate}
                        onSave={handleSaveNews}
                        isSaved={!!currentSavedId}
                        />
                    </div>
                    )}
                </div>
            </>
          )}

          {/* SETTINGS PLACEHOLDER */}
          {currentView === 'settings' && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-400">Configurações em desenvolvimento</h3>
                  <p className="text-gray-400 mt-2">Personalização de tom de voz e integração com CMS em breve.</p>
              </div>
          )}

        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2024 NewsAI.pro - Ferramenta Jornalística Assistiva.</p>
            <div className="flex gap-4 text-sm text-gray-400">
                <a href="#" className="hover:text-gray-600">Termos</a>
                <a href="#" className="hover:text-gray-600">Privacidade</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
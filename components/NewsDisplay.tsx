import React, { useState, useEffect } from 'react';
import { GeneratedNews, NewsCategory } from '../types';
import { Share2, Clock, Bookmark, Printer, Sparkles, Loader2, Check } from 'lucide-react';
import { optimizeHeadline } from '../services/geminiService';

interface NewsDisplayProps {
  news: GeneratedNews;
  category: NewsCategory;
  onUpdateHeadline: (newHeadline: string) => void;
  onSave: () => void;
  isSaved?: boolean;
}

const NewsDisplay: React.FC<NewsDisplayProps> = ({ news, category, onUpdateHeadline, onSave, isSaved = false }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (isSaved) {
        setJustSaved(true);
        const timer = setTimeout(() => setJustSaved(false), 2000);
        return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Use the image provided in the news object (from upload), otherwise fallback to Picsum
  const imageUrl = news.imageUrl || `https://picsum.photos/id/${category.length + 50}/800/400`;

  const handleOptimizeTitle = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    try {
        const newTitle = await optimizeHeadline(news.manchete, news.subtitulo, news.lead, category);
        onUpdateHeadline(newTitle);
    } catch (error) {
        console.error("Erro ao otimizar título", error);
        alert("Não foi possível otimizar o título agora.");
    } finally {
        setIsOptimizing(false);
    }
  };

  // Get author initials for avatar
  const authorName = news.author || 'Redação Digital';
  const authorInitials = authorName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Article Header */}
      <div className="p-6 md:p-10 pb-6 border-b border-gray-100">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
          {category}
        </span>
        
        <div className="flex justify-between items-start gap-4 mb-4 group">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-serif leading-tight flex-grow">
            {news.manchete}
            </h1>
            <button 
                onClick={handleOptimizeTitle}
                disabled={isOptimizing}
                className="flex-shrink-0 mt-2 p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                title="Otimizar Título com IA"
            >
                {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
            </button>
        </div>

        <h2 className="text-xl text-gray-600 font-light leading-snug">
          {news.subtitulo}
        </h2>
        
        <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                {authorInitials}
             </div>
             <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{authorName}</span>
                <span className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" /> {currentDate}
                </span>
             </div>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={onSave}
                className={`p-2 rounded-full transition-colors ${isSaved ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`} 
                title={isSaved ? "Salvo" : "Salvar no Histórico"}
                disabled={isSaved}
             >
                {justSaved ? <Check className="w-5 h-5" /> : <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />}
             </button>
             <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-indigo-600 transition-colors" title="Imprimir" onClick={() => window.print()}>
                <Printer className="w-5 h-5" />
             </button>
             <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-indigo-600 transition-colors" title="Compartilhar">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="w-full h-64 md:h-80 overflow-hidden bg-gray-100 relative group">
        <img 
            src={imageUrl} 
            alt="Imagem ilustrativa" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">
            {news.imageUrl ? 'Imagem enviada pelo usuário' : 'Imagem Ilustrativa via Picsum'}
        </div>
      </div>

      {/* Article Body */}
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        {/* Lead */}
        <div className="mb-8 p-6 bg-gray-50 border-l-4 border-indigo-500 rounded-r-lg">
          <p className="text-lg md:text-xl font-medium text-gray-800 font-serif italic">
            "{news.lead}"
          </p>
        </div>

        {/* Main Text */}
        <div className="space-y-6 font-serif text-lg text-gray-800 leading-relaxed">
          {news.corpo.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Context & Future Box */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
           <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="font-sans font-bold text-blue-800 mb-2 uppercase text-sm tracking-wide">Contexto</h3>
              <p className="text-blue-900/80 text-sm leading-relaxed">
                  {news.contexto}
              </p>
           </div>
           
           <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="font-sans font-bold text-emerald-800 mb-2 uppercase text-sm tracking-wide">O que vem a seguir</h3>
              <p className="text-emerald-900/80 text-sm leading-relaxed">
                  {news.desdobramento}
              </p>
           </div>
        </div>
      </div>
      
      {/* Footer Disclaimer */}
      <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Este conteúdo foi gerado automaticamente por Inteligência Artificial (Gemini) com base em fatos fornecidos pelo usuário. 
          Verifique sempre as informações antes de publicar.
        </p>
      </div>
    </div>
  );
};

export default NewsDisplay;
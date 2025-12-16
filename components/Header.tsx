import React from 'react';
import { Newspaper, LayoutDashboard, FileArchive, Settings, BookOpen } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  
  const getLinkClass = (view: ViewState) => {
    const base = "flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer";
    return currentView === view 
      ? `${base} bg-indigo-800 text-white` 
      : `${base} text-indigo-100 hover:bg-indigo-800/50 hover:text-white`;
  };

  return (
    <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-white p-1.5 rounded-lg">
            <Newspaper className="w-6 h-6 text-indigo-900" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">NewsAI<span className="text-indigo-300">.pro</span></h1>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest leading-none">Redação Inteligente</p>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-2 text-sm font-medium">
          <button 
            className={getLinkClass('dashboard')}
            onClick={() => onNavigate('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" /> Painel
          </button>

          <button 
            className={getLinkClass('history')}
            onClick={() => onNavigate('history')}
          >
            <BookOpen className="w-4 h-4" /> Histórico
          </button>
          
          <button 
            className={getLinkClass('files')}
            onClick={() => onNavigate('files')}
          >
            <FileArchive className="w-4 h-4" /> Arquivos
          </button>
          
          <button 
            className={getLinkClass('settings')}
            onClick={() => onNavigate('settings')}
          >
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </nav>
        
        <div className="md:hidden">
            {/* Mobile menu placeholder */}
            <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center">
               <span className="text-xs font-bold">JD</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
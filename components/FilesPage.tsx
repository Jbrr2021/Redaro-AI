import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Trash2, FileArchive } from 'lucide-react';
import { StoredFile } from '../types';

interface FilesPageProps {
  files: StoredFile[];
  onAddFile: (file: StoredFile) => void;
  onRemoveFile: (id: string) => void;
}

const FilesPage: React.FC<FilesPageProps> = ({ files, onAddFile, onRemoveFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    
    setIsProcessing(true);
    
    Array.from(fileList).forEach(file => {
      // Validate type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (!isImage && !isPdf) {
        alert(`Arquivo ${file.name} ignorado. Apenas Imagens e PDF são aceitos.`);
        return;
      }

      // 5MB limit check (optional but good practice)
      if (file.size > 5 * 1024 * 1024) {
         alert(`Arquivo ${file.name} é muito grande (Máx 5MB).`);
         return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        
        const newFile: StoredFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: isImage ? 'image' : 'pdf',
          mimeType: file.type,
          data: base64String,
          size: file.size,
          uploadDate: new Date()
        };
        
        onAddFile(newFile);
      };
      reader.readAsDataURL(file);
    });

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Arquivos e Mídia</h2>
        <p className="text-gray-600 mt-2">
          Gerencie documentos (PDF) e imagens para alimentar a Inteligência Artificial durante a redação.
        </p>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer mb-10
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*,application/pdf"
        />
        
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Clique para upload ou arraste arquivos</h3>
        <p className="text-gray-500 text-sm mt-2">Suporta Imagens (PNG, JPG) e Documentos (PDF)</p>
        <p className="text-xs text-gray-400 mt-1">Dica: Converta arquivos Word para PDF antes de enviar.</p>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
           <FileArchive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
           <p className="text-gray-500">Nenhum arquivo enviado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map(file => (
            <div key={file.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
               <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                 {file.type === 'image' ? (
                   <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover" />
                 ) : (
                   <FileText className="w-12 h-12 text-red-500" />
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveFile(file.id); }}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
               </div>
               <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 truncate max-w-[180px]" title={file.name}>{file.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{formatSize(file.size)} • {file.type.toUpperCase()}</p>
                    </div>
                    {file.type === 'image' ? <ImageIcon className="w-4 h-4 text-gray-400" /> : <FileText className="w-4 h-4 text-gray-400" />}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesPage;
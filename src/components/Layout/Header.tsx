import React from 'react';
import { Menu, X, Code2, Search, Save, Play, Settings, Eye } from 'lucide-react';
import { FileNode } from '../../types';
import { extractDisplayPathFromSafUri } from '../../utils/fileUtils';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeFile: FileNode | null;
  showSearch: boolean;
  onToggleSearch: () => void;
  isSaving: boolean;
  onSave: () => void;
  onPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  activeFile,
  showSearch,
  onToggleSearch,
  isSaving,
  onSave,
  onPreview
}) => {
  return (
    <header className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 justify-between z-50 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code2 size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-sm hidden sm:block tracking-tight text-white">
            CodeStudio <span className="text-blue-500">Mobile</span>
          </h1>
          {activeFile && (
            <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Path</span>
              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">
                {extractDisplayPathFromSafUri(`content://com.android.externalstorage.documents/document/primary:${activeFile.name}`) || 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeFile && (
          <>
            {activeFile.name.toLowerCase().endsWith('.html') && (
              <button 
                onClick={onPreview}
                className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                title="Preview HTML"
              >
                <Eye size={18} />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}
            <button onClick={onToggleSearch} className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${showSearch ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400'}`}>
              <Search size={18} />
            </button>
            <button 
              onClick={onSave}
              className={`p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${isSaving ? 'text-green-500' : 'text-gray-400'}`}
            >
              <Save size={18} className={isSaving ? 'animate-bounce' : ''} />
              <span className="hidden sm:inline">{isSaving ? 'Saved!' : 'Save'}</span>
            </button>
          </>
        )}
        <button className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium">
          <Play size={16} fill="currentColor" />
          <span className="hidden sm:inline">Run</span>
        </button>
        <button className="p-2 hover:bg-white/5 text-gray-400 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

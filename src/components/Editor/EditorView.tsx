import React from 'react';
import { X, FileCode, Search, ChevronUp, ChevronDown, Replace, ReplaceAll, Code2 } from 'lucide-react';
import { SmartEditor } from '../../features/editor/components/SmartEditor';
import { FileNode } from '../../types';
import { QuickCharBar } from '../QuickCharBar';

interface EditorViewProps {
  files: FileNode[];
  openTabIds: string[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
  activeFile: FileNode | null;
  updateFileContent: (id: string, content: string) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
  onInsertChar: (char: string) => void;
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  searchResults: number[];
  searchIndex: number;
  onNextResult: () => void;
  onPrevResult: () => void;
  onReplace: (all?: boolean) => void;
  onOpenFolder: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  files,
  openTabIds,
  activeTabId,
  onTabSelect,
  onTabClose,
  activeFile,
  updateFileContent,
  onKeyDown,
  onInsertChar,
  showSearch,
  searchQuery,
  setSearchQuery,
  onSearch,
  searchResults,
  searchIndex,
  onNextResult,
  onPrevResult,
  onReplace,
  onOpenFolder
}) => {

  const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f] overflow-hidden">
      {/* Tabs */}
      <div className="h-10 bg-[#1a1a1a] border-b border-[#2a2a2a] flex overflow-x-auto no-scrollbar shrink-0">
        {openTabIds.map(id => {
          const file = findFileById(files, id);
          if (!file) return null;
          return (
            <button
              key={id}
              onClick={() => onTabSelect(id)}
              className={`flex items-center gap-2 px-4 h-full border-r border-[#2a2a2a] min-w-[120px] max-w-[200px] transition-colors relative group ${
                activeTabId === id ? 'bg-[#0f0f0f] text-blue-400' : 'text-gray-500 hover:bg-white/5'
              }`}
            >
              <FileCode size={14} />
              <span className="text-xs truncate flex-1 text-left">{file.name}</span>
              {file.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
              <button
                onClick={(e) => onTabClose(id, e)}
                className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {activeTabId === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
          );
        })}
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeFile ? (
          <>
            {showSearch && (
              <div className="absolute top-0 left-0 right-0 z-30 bg-[#1a1a1a] border-b border-[#2a2a2a] p-2 flex flex-wrap items-center gap-2 animate-in slide-in-from-top duration-200">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    placeholder="Search..."
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-8 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-mono mr-2">
                    {searchResults.length > 0 ? `${searchIndex + 1}/${searchResults.length}` : '0/0'}
                  </span>
                  <button onClick={onPrevResult} className="p-1.5 hover:bg-white/5 rounded text-gray-400"><ChevronUp size={14} /></button>
                  <button onClick={onNextResult} className="p-1.5 hover:bg-white/5 rounded text-gray-400"><ChevronDown size={14} /></button>
                  <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
                  <button onClick={() => onReplace()} className="p-1.5 hover:bg-white/5 rounded text-gray-400" title="Replace"><Replace size={14} /></button>
                  <button onClick={() => onReplace(true)} className="p-1.5 hover:bg-white/5 rounded text-gray-400" title="Replace All"><ReplaceAll size={14} /></button>
                </div>
              </div>
            )}

            <QuickCharBar onInsert={onInsertChar} />

            <div className="flex-1 overflow-hidden editor-textarea custom-scrollbar">
              <SmartEditor
                value={activeFile.content || ''}
                onValueChange={(code) => updateFileContent(activeFile.id, code)}
                language={activeFile.language as 'html' | 'css' | 'javascript' | 'js' || 'javascript'}
                onKeyDown={onKeyDown}
                className="min-h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Code2 size={32} className="opacity-20" />
            </div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">Welcome to CodeStudio</h3>
            <p className="text-xs max-w-xs leading-relaxed opacity-60">
              Open a folder to start editing files. Your changes are saved automatically to your local system.
            </p>
            <button 
              onClick={onOpenFolder}
              className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              Select Folder
            </button>
          </div>
        )}
        
        {/* Mobile Keyboard Buffer */}
        <div className="h-40 md:hidden" />
      </div>
    </main>
  );
};

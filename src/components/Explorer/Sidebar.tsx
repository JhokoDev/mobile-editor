import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  FileCode,
  X,
  FolderOpen,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  FilePlus,
  FolderPlus,
  Files,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileNode, FileOperationType } from '../../types';

interface SidebarProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
  onClose: () => void;
  onOpenFolder: () => void;
  isFileSystemSupported: boolean;
  onFileOperation: (type: FileOperationType, nodeId: string) => void;
  onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files,
  onFileSelect, 
  selectedFileId, 
  onClose,
  onOpenFolder,
  isFileSystemSupported,
  onFileOperation,
  onExport
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    }).map((node) => (
      <div key={node.id} className="relative group">
        <button
          onClick={() => {
            if (node.type === 'folder') toggleFolder(node.id);
            else onFileSelect(node);
          }}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
          className={`w-full flex items-center gap-2 py-1.5 px-4 hover:bg-white/5 transition-colors text-sm ${
            selectedFileId === node.id ? 'bg-blue-500/20 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400'
          }`}
          style={{ paddingLeft: `${depth * 12 + 16}px` }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="text-blue-400 opacity-80">📁</span>
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <FileCode size={14} className="text-gray-500" />
            </>
          )}
          <span className="truncate flex-1 text-left">{node.name}</span>
          {node.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleContextMenu(e as unknown as React.MouseEvent, node.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
          >
            <MoreVertical size={12} />
          </button>
        </button>
        {node.type === 'folder' && expandedFolders.has(node.id) && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full bg-[#1a1a1a] flex flex-col border-r border-[#2a2a2a] w-full" onClick={() => setContextMenu(null)}>
      <div className="p-4 flex items-center justify-between border-b border-[#2a2a2a]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Explorer</h2>
        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <>
              <button onClick={() => onFileOperation('create-file', files[0].id)} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white" title="New File">
                <FilePlus size={14} />
              </button>
              <button onClick={() => onFileOperation('create-folder', files[0].id)} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white" title="New Folder">
                <FolderPlus size={14} />
              </button>
            </>
          )}
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-[#2a2a2a] flex flex-col gap-2">
        <button 
          onClick={onOpenFolder}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <FolderOpen size={16} />
          {isFileSystemSupported ? 'Open Local Folder' : 'Select Folder (Fallback)'}
        </button>
        
        {files.length > 0 && (
          <button 
            onClick={onExport}
            className="w-full py-2 px-3 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Save size={14} />
            Export as Zip
          </button>
        )}

        {!isFileSystemSupported && (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2 text-blue-400 text-[9px]">
            <AlertCircle size={12} className="shrink-0 mt-0.5" />
            <p>Using fallback mode. Changes must be exported as Zip to be saved permanently.</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {files.length > 0 ? (
          renderTree(files)
        ) : (
          <div className="px-6 py-10 text-center">
            <Files size={32} className="mx-auto mb-3 opacity-10" />
            <p className="text-xs text-gray-600">No folder opened yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[100] bg-[#252525] border border-[#333] rounded-lg shadow-xl py-1 w-40"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { onFileOperation('rename', contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2">
              <Edit2 size={12} /> Rename
            </button>
            <button onClick={() => { onFileOperation('delete', contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-2">
              <Trash2 size={12} /> Delete
            </button>
            <div className="h-px bg-[#333] my-1" />
            <button onClick={() => { onFileOperation('create-file', contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2">
              <FilePlus size={12} /> New File
            </button>
            <button onClick={() => { onFileOperation('create-folder', contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2">
              <FolderPlus size={12} /> New Folder
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

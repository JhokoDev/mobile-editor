import React, { useState, useEffect, useCallback } from 'react';
import { 
  Code2, 
  Files, 
  Settings, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown,
  FileCode,
  Terminal,
  Play,
  Save,
  FolderOpen,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Search,
  FilePlus,
  FolderPlus,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import JSZip from 'jszip';
import debounce from 'lodash/debounce';

import { usePreview } from './preview/usePreview';
import { PreviewContainer } from './preview/PreviewContainer';

// Load Prism languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// --- Types ---
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  handle?: FileSystemHandle;
  isDirty?: boolean;
}

// --- Helpers ---
const getLanguageFromExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    py: 'python',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    css: 'css',
    json: 'json',
    md: 'markdown',
    html: 'markup',
  };
  return map[extension] || 'plaintext';
};

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

const findParentNode = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.children?.some(child => child.id === id)) return node;
    if (node.children) {
      const found = findParentNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const extractDisplayPathFromSafUri = (safUri: string): string | null => {
  if (!safUri || typeof safUri !== 'string') return null;

  const marker = '/document/';
  const index = safUri.indexOf(marker);
  if (index === -1) return null;

  const encodedDocumentId = safUri.substring(index + marker.length);

  const queryIndex = encodedDocumentId.indexOf('?');
  const cleanEncoded =
    queryIndex !== -1
      ? encodedDocumentId.substring(0, queryIndex)
      : encodedDocumentId;

  let documentId: string;
  try {
    documentId = decodeURIComponent(cleanEncoded);
  } catch {
    return null;
  }

  const colonIndex = documentId.indexOf(':');
  if (colonIndex === -1) return null;

  const storageType = documentId.substring(0, colonIndex);
  const relativePath = documentId.substring(colonIndex + 1);

  if (storageType !== 'primary') return null;
  if (!relativePath) return null;

  return relativePath; // Apenas para UI
};

// --- Components ---

const QuickCharBar = ({ onInsert }: { onInsert: (char: string) => void }) => {
  const chars = ['{', '}', '(', ')', '[', ']', '<', '>', ';', '=', '"', "'", ':', '/', '\\', '|'];
  return (
    <div className="h-10 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-2 gap-1 overflow-x-auto no-scrollbar">
      {chars.map(char => (
        <button
          key={char}
          onClick={() => onInsert(char)}
          className="min-w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white font-mono text-sm transition-colors"
        >
          {char}
        </button>
      ))}
    </div>
  );
};

const Sidebar = ({ 
  files,
  onFileSelect, 
  selectedFileId, 
  onClose,
  onOpenFolder,
  isFileSystemSupported,
  onFileOperation,
  onExport
}: { 
  files: FileNode[];
  onFileSelect: (file: FileNode) => void; 
  selectedFileId?: string;
  onClose: () => void;
  onOpenFolder: () => void;
  isFileSystemSupported: boolean;
  onFileOperation: (type: 'create-file' | 'create-folder' | 'rename' | 'delete', nodeId: string) => void;
  onExport: () => void;
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

      {/* Context Menu */}
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

export default function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { state: previewState, controller: previewController } = usePreview();

  const activeFile = findFileById(files, activeTabId);
  const fallbackInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTabs = localStorage.getItem('openTabIds');
    const savedActive = localStorage.getItem('activeTabId');
    if (savedTabs) setOpenTabIds(JSON.parse(savedTabs));
    if (savedActive) setActiveTabId(savedActive);
  }, []);

  useEffect(() => {
    localStorage.setItem('openTabIds', JSON.stringify(openTabIds));
    localStorage.setItem('activeTabId', activeTabId);
  }, [openTabIds, activeTabId]);

  useEffect(() => {
    setIsFileSystemSupported('showDirectoryPicker' in window);
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-save logic
  const debouncedSave = useCallback(
    debounce(async (file: FileNode) => {
      if (!file.handle || !file.isDirty) return;
      try {
        const fileHandle = file.handle as FileSystemFileHandle;
        const writable = await fileHandle.createWritable();
        await writable.write(file.content || '');
        await writable.close();
        
        setFiles(prev => {
          const updateNodes = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
              if (node.id === file.id) return { ...node, isDirty: false };
              if (node.children) return { ...node, children: updateNodes(node.children) };
              return node;
            });
          };
          return updateNodes(prev);
        });
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 2000),
    []
  );

  const handleOpenFolder = async () => {
    if (!isFileSystemSupported) {
      fallbackInputRef.current?.click();
      return;
    }
    try {
      // @ts-expect-error - showDirectoryPicker is a modern API
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      const rootNode = await scanDirectory(directoryHandle);
      setFiles([rootNode]);
      setIsSidebarOpen(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Error opening directory:', err);
      // Fallback if API fails (other than user cancel)
      if (confirm('File System Access API failed. Use fallback folder selection?')) {
        fallbackInputRef.current?.click();
      }
    }
  };

  const handleOpenFolderFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    const root: FileNode = {
      id: 'root',
      name: inputFiles[0].webkitRelativePath.split('/')[0] || 'Project',
      type: 'folder',
      children: []
    };

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      const path = file.webkitRelativePath.split('/').slice(1);
      let current = root;

      for (let j = 0; j < path.length; j++) {
        const part = path[j];
        const isLast = j === path.length - 1;

        if (isLast) {
          const content = await file.text();
          current.children?.push({
            id: Math.random().toString(36).substr(2, 9),
            name: part,
            type: 'file',
            language: getLanguageFromExtension(part),
            content,
            isDirty: false
          });
        } else {
          let folder = current.children?.find(c => c.name === part && c.type === 'folder');
          if (!folder) {
            folder = {
              id: Math.random().toString(36).substr(2, 9),
              name: part,
              type: 'folder',
              children: []
            };
            current.children?.push(folder);
          }
          current = folder;
        }
      }
    }

    setFiles([root]);
    setIsSidebarOpen(true);
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    
    const addToZip = (nodes: FileNode[], path = '') => {
      nodes.forEach(node => {
        const currentPath = path ? `${path}/${node.name}` : node.name;
        if (node.type === 'file') {
          zip.file(currentPath, node.content || '');
        } else if (node.children) {
          addToZip(node.children, currentPath);
        }
      });
    };

    addToZip(files);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${files[0]?.name || 'project'}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scanDirectory = async (handle: FileSystemDirectoryHandle): Promise<FileNode> => {
    const node: FileNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: handle.name,
      type: 'folder',
      handle,
      children: []
    };

    // @ts-expect-error - values() is part of the API
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        node.children?.push(await scanDirectory(entry));
      } else {
        node.children?.push({
          id: Math.random().toString(36).substr(2, 9),
          name: entry.name,
          type: 'file',
          language: getLanguageFromExtension(entry.name),
          handle: entry,
          isDirty: false
        });
      }
    }
    return node;
  };

  const handleFileSelect = async (file: FileNode) => {
    if (file.type === 'file') {
      if (!openTabIds.includes(file.id)) {
        setOpenTabIds([...openTabIds, file.id]);
        
        if (file.handle && !file.content) {
          try {
            const fileHandle = file.handle as FileSystemFileHandle;
            const fileData = await fileHandle.getFile();
            const content = await fileData.text();
            
            setFiles(prev => {
              const updateNodes = (nodes: FileNode[]): FileNode[] => {
                return nodes.map(node => {
                  if (node.id === file.id) return { ...node, content, isDirty: false };
                  if (node.children) return { ...node, children: updateNodes(node.children) };
                  return node;
                });
              };
              return updateNodes(prev);
            });
          } catch (err) {
            console.error('Error reading file:', err);
          }
        }
      }
      setActiveTabId(file.id);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabIds.filter(tabId => tabId !== id);
    setOpenTabIds(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : '');
    }
  };

  const updateFileContent = (id: string, newContent: string) => {
    setFiles(prev => {
      const updateNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === id) {
            const updated = { ...node, content: newContent, isDirty: true };
            debouncedSave(updated);
            return updated;
          }
          if (node.children) {
            return { ...node, children: updateNodes(node.children) };
          }
          return node;
        });
      };
      return updateNodes(prev);
    });
  };

  const handleFileOperation = async (type: 'create-file' | 'create-folder' | 'rename' | 'delete', nodeId: string) => {
    const node = findFileById(files, nodeId);
    if (!node) return;

    try {
      if (type === 'delete') {
        if (!confirm(`Are you sure you want to delete ${node.name}?`)) return;
        if (node.handle) {
          const parent = findParentNode(files, nodeId);
          if (parent && parent.handle && parent.handle.kind === 'directory') {
            await (parent.handle as FileSystemDirectoryHandle).removeEntry(node.name, { recursive: true });
          }
        }
        setFiles(prev => {
          const removeNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter(n => n.id !== nodeId).map(n => ({
              ...n,
              children: n.children ? removeNode(n.children) : undefined
            }));
          };
          return removeNode(prev);
        });
        setOpenTabIds(prev => prev.filter(id => id !== nodeId));
      } else if (type === 'rename') {
        const newName = prompt('Enter new name:', node.name);
        if (!newName || newName === node.name) return;
        // Rename is complex with FileSystem API (needs move/copy), for now we just update UI state if no handle
        setFiles(prev => {
          const renameNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(n => {
              if (n.id === nodeId) return { ...n, name: newName };
              if (n.children) return { ...n, children: renameNode(n.children) };
              return n;
            });
          };
          return renameNode(prev);
        });
      } else if (type === 'create-file' || type === 'create-folder') {
        const name = prompt(`Enter ${type === 'create-file' ? 'file' : 'folder'} name:`);
        if (!name) return;

        const parentFolder = node.type === 'folder' ? node : findParentNode(files, nodeId);
        if (!parentFolder) return;

        let newHandle: FileSystemHandle | undefined;
        if (parentFolder.handle && parentFolder.handle.kind === 'directory') {
          const dirHandle = parentFolder.handle as FileSystemDirectoryHandle;
          if (type === 'create-file') {
            newHandle = await dirHandle.getFileHandle(name, { create: true });
          } else {
            newHandle = await dirHandle.getDirectoryHandle(name, { create: true });
          }
        }

        const newNode: FileNode = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          type: type === 'create-file' ? 'file' : 'folder',
          language: type === 'create-file' ? getLanguageFromExtension(name) : undefined,
          content: '',
          handle: newHandle,
          children: type === 'create-folder' ? [] : undefined
        };

        setFiles(prev => {
          const addNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(n => {
              if (n.id === parentFolder.id) return { ...n, children: [...(n.children || []), newNode] };
              if (n.children) return { ...n, children: addNode(n.children) };
              return n;
            });
          };
          return addNode(prev);
        });

        if (type === 'create-file') handleFileSelect(newNode);
      }
    } catch (err) {
      console.error('File operation failed:', err);
      alert('Operation failed. Check permissions.');
    }
  };

  const handleSave = async () => {
    if (!activeFile) return;
    
    if (!activeFile.handle) {
      // Fallback: Download single file
      const blob = new Blob([activeFile.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
      
      setFiles(prev => {
        const updateNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.id === activeFile.id) return { ...node, isDirty: false };
            if (node.children) return { ...node, children: updateNodes(node.children) };
            return node;
          });
        };
        return updateNodes(prev);
      });
      return;
    }

    try {
      setIsSaving(true);
      const fileHandle = activeFile.handle as FileSystemFileHandle;
      const writable = await fileHandle.createWritable();
      await writable.write(activeFile.content || '');
      await writable.close();
      
      setFiles(prev => {
        const updateNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.id === activeFile.id) return { ...node, isDirty: false };
            if (node.children) return { ...node, children: updateNodes(node.children) };
            return node;
          });
        };
        return updateNodes(prev);
      });
      setTimeout(() => setIsSaving(false), 1000);
    } catch (err) {
      console.error('Error saving file:', err);
      setIsSaving(false);
      alert('Permission denied or error saving file.');
    }
  };

  const insertChar = (char: string) => {
    if (!activeFile) return;
    const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeFile.content || '';
    const newContent = content.substring(0, start) + char + content.substring(end);
    
    updateFileContent(activeFile.id, newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const [searchIndex, setSearchIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<number[]>([]);

  const handleSearch = useCallback(() => {
    if (!activeFile || !searchQuery) {
      setSearchResults([]);
      return;
    }
    const content = activeFile.content || '';
    const results: number[] = [];
    let pos = content.indexOf(searchQuery);
    while (pos !== -1) {
      results.push(pos);
      pos = content.indexOf(searchQuery, pos + 1);
    }
    setSearchResults(results);
    setSearchIndex(0);
    
    if (results.length > 0) {
      const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(results[0], results[0] + searchQuery.length);
      }
    }
  }, [activeFile, searchQuery]);

  const nextResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (searchIndex + 1) % searchResults.length;
    setSearchIndex(nextIdx);
    const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(searchResults[nextIdx], searchResults[nextIdx] + searchQuery.length);
    }
  };

  const prevResult = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(prevIdx);
    const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(searchResults[prevIdx], searchResults[prevIdx] + searchQuery.length);
    }
  };

  const handleReplace = (all = false) => {
    if (!activeFile || !searchQuery) return;
    const replaceWith = prompt('Replace with:');
    if (replaceWith === null) return;

    const content = activeFile.content || '';
    let newContent = '';
    if (all) {
      newContent = content.split(searchQuery).join(replaceWith);
    } else {
      if (searchResults.length === 0) return;
      const pos = searchResults[searchIndex];
      newContent = content.substring(0, pos) + replaceWith + content.substring(pos + searchQuery.length);
    }
    updateFileContent(activeFile.id, newContent);
    setTimeout(handleSearch, 0);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeFile) return;
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    // Auto-closing brackets
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key]) {
      e.preventDefault();
      const char = e.key;
      const closingChar = pairs[char];
      const newValue = value.substring(0, selectionStart) + char + closingChar + value.substring(selectionEnd);
      updateFileContent(activeFile.id, newValue);
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    // Auto-indentation on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const line = value.substring(0, selectionStart).split('\n').pop() || '';
      const indent = line.match(/^\s*/)?.[0] || '';
      const extraIndent = line.trim().endsWith('{') ? '  ' : '';
      const newValue = value.substring(0, selectionStart) + '\n' + indent + extraIndent + value.substring(selectionEnd);
      updateFileContent(activeFile.id, newValue);
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1 + indent.length + extraIndent.length, selectionStart + 1 + indent.length + extraIndent.length);
      }, 0);
    }
  };

  const highlightCode = (code: string, language: string) => {
    const prismLang = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(code, prismLang, language);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f0f] text-gray-300 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 justify-between z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
                  onClick={() => previewController.openPreview(activeFile.content || '')}
                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                  title="Preview HTML"
                >
                  <Eye size={18} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              )}
              <button onClick={() => setShowSearch(!showSearch)} className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${showSearch ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400'}`}>
                <Search size={18} />
              </button>
              <button 
                onClick={handleSave}
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

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 z-40"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={isMobile ? { x: -280 } : { width: 280 }}
          animate={isMobile ? { x: isSidebarOpen ? 0 : -280 } : { width: isSidebarOpen ? 280 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`${isMobile ? 'absolute inset-y-0 left-0 z-50' : 'relative'} h-full overflow-hidden bg-[#1a1a1a]`}
          style={isMobile ? { width: 280 } : {}}
        >
          <Sidebar 
            files={files}
            onFileSelect={handleFileSelect} 
            selectedFileId={activeTabId}
            onClose={() => setIsSidebarOpen(false)}
            onOpenFolder={handleOpenFolder}
            isFileSystemSupported={isFileSystemSupported}
            onFileOperation={handleFileOperation}
            onExport={handleExportZip}
          />
        </motion.aside>

        {/* Hidden Fallback Input */}
        <input 
          type="file" 
          ref={fallbackInputRef}
          style={{ display: 'none' }}
          // @ts-expect-error - webkitdirectory is a non-standard attribute
          webkitdirectory="" 
          directory=""
          onChange={handleOpenFolderFallback}
        />

        {/* Editor Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
          {/* Tabs */}
          <div className="h-10 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center overflow-x-auto no-scrollbar shrink-0">
            {openTabIds.map(tabId => {
              const file = findFileById(files, tabId);
              if (!file) return null;
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTabId(tabId)}
                  className={`h-full px-4 flex items-center gap-2 border-r border-[#2a2a2a] text-xs min-w-[120px] max-w-[200px] transition-colors relative group ${
                    activeTabId === tabId ? 'bg-[#0f0f0f] text-blue-400' : 'bg-[#1a1a1a] text-gray-500 hover:bg-[#222]'
                  }`}
                >
                  <FileCode size={12} className={activeTabId === tabId ? 'text-blue-400' : 'text-gray-600'} />
                  <span className="truncate flex-1 text-left">{file.name}</span>
                  {file.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                  <button 
                    onClick={(e) => closeTab(tabId, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  {activeTabId === tabId && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
              );
            })}
          </div>

          {/* Quick Character Bar */}
          {activeFile && <QuickCharBar onInsert={insertChar} />}

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#1a1a1a] border-b border-[#2a2a2a] p-2 flex flex-col gap-2 shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Find" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full bg-[#0f0f0f] border border-[#333] rounded px-9 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    {searchResults.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">
                        {searchIndex + 1}/{searchResults.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={prevResult} className="p-1.5 hover:bg-white/5 rounded text-gray-400"><ChevronRight size={14} className="rotate-180" /></button>
                    <button onClick={nextResult} className="p-1.5 hover:bg-white/5 rounded text-gray-400"><ChevronRight size={14} /></button>
                    <button onClick={() => handleReplace(false)} className="px-2 py-1 hover:bg-white/5 rounded text-[10px] text-gray-400 border border-[#333]">Replace</button>
                    <button onClick={() => handleReplace(true)} className="px-2 py-1 hover:bg-white/5 rounded text-[10px] text-gray-400 border border-[#333]">All</button>
                    <button onClick={() => { setShowSearch(false); setSearchResults([]); }} className="p-1.5 hover:bg-white/5 rounded text-gray-400"><X size={14} /></button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code Editor */}
          <div className="flex-1 overflow-auto relative bg-[#0f0f0f] editor-container">
            {activeFile ? (
              <div className="min-h-full">
                <Editor
                  value={activeFile.content || ''}
                  onValueChange={(code) => updateFileContent(activeFile.id, code)}
                  highlight={(code) => highlightCode(code, activeFile.language || 'javascript')}
                  onKeyDown={handleEditorKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement> & React.KeyboardEventHandler<HTMLTextAreaElement>}
                  padding={24}
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: 14,
                    minHeight: '100%',
                    backgroundColor: 'transparent',
                    color: '#e0e0e0',
                  }}
                  className="editor-textarea focus:outline-none"
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <Code2 size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm">Open a folder to start editing local files</p>
                <button 
                  onClick={handleOpenFolder}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all"
                >
                  Select Folder
                </button>
              </div>
            )}
            
            {/* Mobile Keyboard Buffer */}
            <div className="h-40 md:hidden" />
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-7 bg-blue-600 text-white flex items-center px-3 text-[10px] justify-between font-medium shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Terminal size={12} />
            <span>Ready</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span className="uppercase">{activeFile?.language || 'Plain Text'}</span>
          <div className="flex items-center gap-1.5">
            <Bell size={12} />
          </div>
        </div>
      </footer>

      <PreviewContainer 
        isOpen={previewState.isOpen} 
        html={previewState.html} 
        onClose={previewController.closePreview} 
      />
    </div>
  );
}

const Bell = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

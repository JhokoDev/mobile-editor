import React, { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Types ---
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
}

// --- Mock Data ---
const MOCK_FILES: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'main.py',
        type: 'file',
        language: 'python',
        content: `def hello_world():\n    print("Hello from Mobile Code Studio!")\n\nif __name__ == "__main__":\n    hello_world()`,
      },
      {
        id: '3',
        name: 'utils.js',
        type: 'file',
        language: 'javascript',
        content: `export const formatDate = (date) => {\n  return new Intl.DateTimeFormat('en-US').format(date);\n};`,
      },
    ],
  },
  {
    id: '4',
    name: 'styles.css',
    type: 'file',
    language: 'css',
    content: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}`,
  },
  {
    id: '5',
    name: 'config.json',
    type: 'file',
    language: 'json',
    content: `{\n  "theme": "dark",\n  "fontSize": 14,\n  "tabSize": 2\n}`,
  },
];

// --- Components ---

const Sidebar = ({ 
  onFileSelect, 
  selectedFileId, 
  onClose 
}: { 
  onFileSelect: (file: FileNode) => void; 
  selectedFileId?: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFolders(newExpanded);
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <button
          onClick={() => {
            if (node.type === 'folder') toggleFolder(node.id);
            else onFileSelect(node);
          }}
          className={`w-full flex items-center gap-2 py-2 px-4 hover:bg-white/5 transition-colors text-sm ${
            selectedFileId === node.id ? 'bg-blue-500/20 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400'
          }`}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="text-blue-400">📁</span>
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <FileCode size={14} className="text-gray-500" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {node.type === 'folder' && expandedFolders.has(node.id) && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full bg-[#1a1a1a] flex flex-col border-r border-[#2a2a2a] w-full">
      <div className="p-4 flex items-center justify-between border-b border-[#2a2a2a]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Explorer</h2>
        <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(MOCK_FILES)}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(MOCK_FILES[0].children![0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f0f] text-gray-300 font-sans">
      {/* Header */}
      <header className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 justify-between z-50">
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
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            onFileSelect={handleFileSelect} 
            selectedFileId={selectedFile?.id}
            onClose={() => setIsSidebarOpen(false)}
          />
        </motion.aside>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
          {/* Tabs / Breadcrumbs */}
          <div className="h-10 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Files size={12} />
              <span>{selectedFile?.name || 'No file selected'}</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-auto relative">
            {selectedFile ? (
              <SyntaxHighlighter
                language={selectedFile.language || 'javascript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '24px',
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  minHeight: '100%',
                }}
                showLineNumbers={true}
                lineNumberStyle={{ minWidth: '3em', paddingRight: '1.5em', color: '#444', textAlign: 'right' }}
              >
                {selectedFile.content || ''}
              </SyntaxHighlighter>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <Code2 size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm">Select a file from the explorer to begin</p>
              </div>
            )}
            
            {/* Mobile Keyboard Buffer */}
            <div className="h-40 md:hidden" />
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-7 bg-blue-600 text-white flex items-center px-3 text-[10px] justify-between font-medium">
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
          <span className="uppercase">{selectedFile?.language || 'Plain Text'}</span>
          <div className="flex items-center gap-1.5">
            <Bell size={12} />
          </div>
        </div>
      </footer>
    </div>
  );
}

const Bell = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

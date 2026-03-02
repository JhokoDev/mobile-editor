'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, FileJson, FileText, Folder } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
  content?: string;
}

const mockFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="p-4">\n      <h1 className="text-2xl font-bold">Hello VS Code Mobile!</h1>\n    </div>\n  );\n}`,
      },
      {
        id: '3',
        name: 'index.css',
        type: 'file',
        language: 'css',
        content: `body {\n  margin: 0;\n  padding: 0;\n  background: #1e1e1e;\n}`,
      },
    ],
  },
  {
    id: '4',
    name: 'package.json',
    type: 'file',
    language: 'json',
    content: `{\n  "name": "vscode-mobile",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}`,
  },
  {
    id: '5',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# VS Code Mobile\n\nA mobile-optimized code editor experience.`,
  },
];

interface ExplorerProps {
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
  activeTab: string;
}

export default function Explorer({ onFileSelect, selectedFileId, activeTab }: ExplorerProps) {
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <button
          onClick={() => node.type === 'file' && onFileSelect(node)}
          className={`w-full flex items-center gap-2 py-1 px-4 hover:bg-[#2a2d2e] transition-colors text-sm ${
            selectedFileId === node.id ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'
          }`}
          style={{ paddingLeft: `${depth * 12 + 16}px` }}
        >
          {node.type === 'folder' ? (
            <>
              <ChevronDown size={16} className="text-[#858585]" />
              <Folder size={16} className="text-[#007acc]" />
            </>
          ) : (
            <>
              <span className="w-4" />
              {node.name.endsWith('.tsx') ? (
                <FileCode size={16} className="text-[#519aba]" />
              ) : node.name.endsWith('.json') ? (
                <FileJson size={16} className="text-[#cbcb41]" />
              ) : (
                <FileText size={16} className="text-[#858585]" />
              )}
            </>
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {node.type === 'folder' && node.children && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const [searchQuery, setSearchQuery] = useState('');

  const renderSearch = () => (
    <div className="p-4 flex flex-col gap-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] outline-none px-2 py-1 text-sm text-white"
        />
      </div>
      <div className="text-[#858585] text-xs">
        {searchQuery ? `No results for "${searchQuery}"` : 'Type to search across files'}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#252526] flex flex-col border-r border-[#3c3c3c]">
      <div className="p-3 text-[11px] uppercase tracking-wider font-bold text-[#858585] flex justify-between items-center">
        <span>{activeTab === 'explorer' ? 'Explorer' : 'Search'}</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {activeTab === 'explorer' ? (
          <>
            <div className="px-4 py-1 text-[11px] font-bold text-[#cccccc] flex items-center gap-1">
              <ChevronDown size={14} />
              <span className="uppercase">VSCODE-MOBILE</span>
            </div>
            {renderTree(mockFiles)}
          </>
        ) : (
          renderSearch()
        )}
      </div>
    </div>
  );
}

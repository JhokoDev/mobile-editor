'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EditorProps {
  file: {
    name: string;
    content: string;
    language: string;
  } | null;
}

export default function Editor({ file }: EditorProps) {
  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-[#3c3c3c]">
        <div className="w-48 h-48 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium">Select a file to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Tabs */}
      <div className="flex bg-[#252526] border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border-t border-t-[#007acc] text-sm text-white">
          <span>{file.name}</span>
          <button className="hover:bg-[#3c3c3c] rounded p-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto font-mono text-sm relative">
        <SyntaxHighlighter
          language={file.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '20px',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
            minHeight: '100%',
          }}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#858585', textAlign: 'right' }}
        >
          {file.content}
        </SyntaxHighlighter>
        
        {/* Mobile Keyboard Spacer */}
        <div className="h-32 md:hidden" />
      </div>
    </div>
  );
}

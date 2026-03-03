import React from 'react';
import { Terminal } from 'lucide-react';
import { FileNode } from '../../types';

interface StatusBarProps {
  activeFile: FileNode | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeFile }) => {
  return (
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
  );
};

const Bell = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

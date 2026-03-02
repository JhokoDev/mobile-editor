'use client';

import React from 'react';
import { GitBranch, Bell, CheckCircle2, RefreshCw } from 'lucide-react';

export default function StatusBar() {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center px-3 text-[11px] justify-between select-none">
      <div className="flex items-center gap-4 h-full">
        <button className="flex items-center gap-1 hover:bg-white/10 px-1 h-full transition-colors">
          <GitBranch size={12} />
          <span>main*</span>
        </button>
        <button className="flex items-center gap-1 hover:bg-white/10 px-1 h-full transition-colors">
          <RefreshCw size={12} />
        </button>
        <div className="flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Prettier</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 h-full">
        <div className="hidden sm:flex items-center gap-3">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
        </div>
        <button className="hover:bg-white/10 px-1 h-full transition-colors">
          <Bell size={12} />
        </button>
      </div>
    </div>
  );
}

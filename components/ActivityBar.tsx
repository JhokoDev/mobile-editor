'use client';

import React, { useState } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Blocks, 
  Settings, 
  UserCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ActivityBar({ activeTab, setActiveTab }: ActivityBarProps) {
  const topIcons = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
    { id: 'debug', icon: Play, label: 'Run and Debug' },
    { id: 'extensions', icon: Blocks, label: 'Extensions' },
  ];

  const bottomIcons = [
    { id: 'account', icon: UserCircle, label: 'Accounts' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-12 md:w-16 bg-[#333333] flex flex-col items-center py-2 border-r border-[#3c3c3c] z-50 h-full">
      <div className="flex-1 flex flex-col gap-1 w-full">
        {topIcons.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative p-3 md:p-4 w-full flex justify-center transition-colors hover:text-white ${
              activeTab === item.id ? 'text-white border-l-2 border-white' : 'text-[#858585]'
            }`}
            title={item.label}
          >
            <item.icon size={24} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1 w-full">
        {bottomIcons.map((item) => (
          <button
            key={item.id}
            className="p-3 md:p-4 w-full flex justify-center text-[#858585] hover:text-white transition-colors"
            title={item.label}
          >
            <item.icon size={24} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

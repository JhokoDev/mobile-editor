import React from 'react';

interface QuickCharBarProps {
  onInsert: (char: string) => void;
}

export const QuickCharBar: React.FC<QuickCharBarProps> = ({ onInsert }) => {
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

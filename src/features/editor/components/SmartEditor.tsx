
import React, { useRef } from 'react';
import { SemanticHighlighter } from './SemanticHighlighter';

interface SmartEditorProps {
  value: string;
  onValueChange: (value: string) => void;
  language: 'html' | 'css' | 'javascript' | 'js';
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  className?: string;
}

export const SmartEditor: React.FC<SmartEditorProps> = ({
  value,
  onValueChange,
  language,
  onKeyDown,
  className = ''
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className={`relative font-mono text-sm overflow-hidden bg-[#0f0f0f] ${className}`} style={{ minHeight: '100%' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={onKeyDown}
        className="absolute inset-0 w-full h-full p-[20px] bg-transparent text-transparent caret-white outline-none resize-none z-10 whitespace-pre overflow-auto custom-scrollbar border-none"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: '1.5',
          tabSize: 2,
        }}
        spellCheck={false}
      />
      <div 
        ref={preRef}
        className="absolute inset-0 w-full h-full p-[20px] pointer-events-none overflow-hidden whitespace-pre"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: '1.5',
          tabSize: 2,
        }}
      >
        <SemanticHighlighter code={value} language={language} />
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import ActivityBar from '@/components/ActivityBar';
import Explorer from '@/components/Explorer';
import Editor from '@/components/Editor';
import StatusBar from '@/components/StatusBar';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
}

export default function VSCodeMobile() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e]">
      {/* Top Mobile Header */}
      {isMobile && (
        <div className="h-12 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-4 justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#cccccc] hover:text-white"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-sm font-medium text-[#cccccc] truncate max-w-[200px]">
            {selectedFile?.name || 'Mobile Code Studio'}
          </span>
          <div className="w-6" /> {/* Spacer */}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Bar - Always visible or hidden on mobile? 
            Let's keep it visible but narrow on mobile. */}
        <ActivityBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Sidebar (Explorer) */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={isMobile ? { x: -300 } : { width: 0 }}
              animate={isMobile ? { x: 0 } : { width: 260 }}
              exit={isMobile ? { x: -300 } : { width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`${isMobile ? 'absolute inset-y-0 left-12 md:left-16 z-40' : 'relative'} h-full bg-[#252526] overflow-hidden shadow-xl md:shadow-none`}
              style={isMobile ? { width: 'calc(100% - 3rem)' } : {}}
            >
              <Explorer 
                onFileSelect={handleFileSelect} 
                selectedFileId={selectedFile?.id} 
                activeTab={activeTab}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <Editor file={selectedFile ? {
            name: selectedFile.name,
            content: selectedFile.content || '',
            language: selectedFile.language || 'plaintext'
          } : null} />
        </main>

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/50 z-30"
          />
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

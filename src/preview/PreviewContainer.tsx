import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PreviewRenderer } from './PreviewRenderer';

interface PreviewContainerProps {
  isOpen: boolean;
  html: string;
  onClose: () => void;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({ isOpen, html, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-white flex flex-col"
        >
          {/* Header */}
          <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center gap-2 text-gray-700"
              aria-label="Back to Editor"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Editor</span>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                Preview Mode
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <PreviewRenderer html={html} />
          </div>
          
          {/* Safe Area Inset for Mobile */}
          <div className="h-[env(safe-area-inset-bottom)] bg-gray-50 flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

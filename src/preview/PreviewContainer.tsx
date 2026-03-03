import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PreviewRenderer } from './PreviewRenderer';
import { VirtualFileMap } from './types';
import { collectCss } from '../features/preview/services/cssCollector';
import { injectCssIntoHtml, composePreviewDocument } from '../features/preview/services/htmlComposer';

interface PreviewContainerProps {
  isOpen: boolean;
  html: string;
  files?: VirtualFileMap;
  onClose: () => void;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({ isOpen, html, files = {}, onClose }) => {
  const composedHtml = React.useMemo(() => {
    if (!isOpen) return '';

    // Strategy 2: Resolve <link> and <script> tags
    let processedHtml = composePreviewDocument({ html, files });

    // Strategy 1: Inject all CSS files if they aren't already linked
    const cssContents = Object.entries(files)
      .filter(([name]) => name.endsWith('.css'))
      .map(([, content]) => content);
    
    const uniqueCss = Array.from(new Set(cssContents));
    const allCss = collectCss(uniqueCss);
    processedHtml = injectCssIntoHtml(processedHtml, allCss);

    // Fallback for empty HTML to avoid white screen
    if (!processedHtml.trim()) {
      processedHtml = '<html><body><div style="padding: 20px; font-family: sans-serif; color: #666;">No content to preview.</div></body></html>';
    }

    return processedHtml;
  }, [isOpen, html, files]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col"
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
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </div>
              <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                Preview Mode
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <PreviewRenderer html={composedHtml} />
          </div>
          
          {/* Safe Area Inset for Mobile */}
          <div className="h-[env(safe-area-inset-bottom)] bg-gray-50 flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PreviewRenderer } from './PreviewRenderer';
import { VirtualFileMap } from './types';
import { resolveCssLinks } from '../features/preview/services/assetResolver';
import { collectCss } from '../features/preview/services/cssCollector';
import { injectCssIntoHtml } from '../features/preview/services/htmlComposer';

interface PreviewContainerProps {
  isOpen: boolean;
  html: string;
  files?: VirtualFileMap;
  onClose: () => void;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({ isOpen, html, files = {}, onClose }) => {
  const composedHtml = React.useMemo(() => {
    if (!isOpen) return '';

    // Strategy 2: Resolve <link> tags
    let processedHtml = resolveCssLinks(html, files);

    // Strategy 1: Inject all CSS files if it's an HTML file and we want global styles
    // For MVP, we'll collect all .css files and inject them if they aren't already linked
    const cssContents = Object.entries(files)
      .filter(([name]) => name.endsWith('.css'))
      .map(([, content]) => content);
    
    const allCss = collectCss(cssContents);
    processedHtml = injectCssIntoHtml(processedHtml, allCss);

    return processedHtml;
  }, [isOpen, html, files]);

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
            <PreviewRenderer html={composedHtml} />
          </div>
          
          {/* Safe Area Inset for Mobile */}
          <div className="h-[env(safe-area-inset-bottom)] bg-gray-50 flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

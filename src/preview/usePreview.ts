import { useState, useCallback } from 'react';
import { PreviewState, PreviewController, VirtualFileMap } from './types';

export const usePreview = () => {
  const [state, setState] = useState<PreviewState>({
    isOpen: false,
    html: '',
    files: {},
  });

  const openPreview = useCallback((html: string, files: VirtualFileMap = {}) => {
    setState({ isOpen: true, html, files });
  }, []);

  const closePreview = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const updatePreview = useCallback((html: string, files: VirtualFileMap = {}) => {
    setState(prev => ({ ...prev, html, files }));
  }, []);

  const controller: PreviewController = {
    openPreview,
    closePreview,
    updatePreview,
  };

  return { state, controller };
};

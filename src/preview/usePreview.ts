import { useState, useCallback } from 'react';
import { PreviewState, PreviewController } from './types';

export const usePreview = () => {
  const [state, setState] = useState<PreviewState>({
    isOpen: false,
    html: '',
  });

  const openPreview = useCallback((html: string) => {
    setState({ isOpen: true, html });
  }, []);

  const closePreview = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const updatePreview = useCallback((html: string) => {
    setState(prev => ({ ...prev, html }));
  }, []);

  const controller: PreviewController = {
    openPreview,
    closePreview,
    updatePreview,
  };

  return { state, controller };
};

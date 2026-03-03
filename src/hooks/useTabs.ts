import { useState, useEffect, useCallback } from 'react';

export const useTabs = () => {
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('openTabIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return localStorage.getItem('activeTabId') || '';
  });

  useEffect(() => {
    localStorage.setItem('openTabIds', JSON.stringify(openTabIds));
    localStorage.setItem('activeTabId', activeTabId);
  }, [openTabIds, activeTabId]);

  const openTab = useCallback((id: string) => {
    setOpenTabIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setOpenTabIds(prev => {
      const newTabs = prev.filter(tabId => tabId !== id);
      if (activeTabId === id) {
        setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : '');
      }
      return newTabs;
    });
  }, [activeTabId]);

  return {
    openTabIds,
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab
  };
};

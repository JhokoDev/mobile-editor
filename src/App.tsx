import React, { useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useFileSystem } from './hooks/useFileSystem';
import { useTabs } from './hooks/useTabs';
import { useEditor } from './hooks/useEditor';
import { useDevice } from './hooks/useDevice';
import { usePreview } from './preview/usePreview';
import { FileNode, FileOperationType } from './types';
import { findFileById } from './utils/fileUtils';
import { exportAsZip } from './services/fileService';

// Components
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Explorer/Sidebar';
import { EditorView } from './components/Editor/EditorView';
import { StatusBar } from './components/Layout/StatusBar';
import { PreviewContainer } from './preview/PreviewContainer';

export default function App() {
  const {
    files,
    isFileSystemSupported,
    isSaving,
    openFolder,
    handleOpenFolderFallback,
    updateFileContent,
    handleFileOperation,
    saveFile,
    readFile
  } = useFileSystem();

  const {
    openTabIds,
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab
  } = useTabs();

  const { isMobile, isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useDevice();
  const { state: previewState, controller: previewController } = usePreview();

  const activeFile = findFileById(files, activeTabId);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    searchResults,
    searchIndex,
    handleSearch,
    nextResult,
    prevResult,
    handleReplace,
    handleEditorKeyDown,
    insertChar
  } = useEditor(activeFile, updateFileContent);

  const handleFileSelect = useCallback(async (file: FileNode) => {
    if (file.type === 'file') {
      await readFile(file);
      openTab(file.id);
      if (isMobile) setIsSidebarOpen(false);
    }
  }, [isMobile, openTab, readFile, setIsSidebarOpen]);

  const onFileOperation = useCallback(async (type: FileOperationType, nodeId: string) => {
    const newNode = await handleFileOperation(type, nodeId);
    if (newNode && newNode.type === 'file') {
      handleFileSelect(newNode);
    }
  }, [handleFileOperation, handleFileSelect]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f0f] text-gray-300 font-sans overflow-hidden">
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        activeFile={activeFile}
        showSearch={showSearch}
        onToggleSearch={() => setShowSearch(!showSearch)}
        isSaving={isSaving}
        onSave={() => activeFile && saveFile(activeFile)}
        onPreview={() => activeFile && previewController.openPreview(activeFile.content || '')}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 z-40"
            />
          )}
        </AnimatePresence>

        <motion.aside
          initial={isMobile ? { x: -280 } : { width: 280 }}
          animate={isMobile ? { x: isSidebarOpen ? 0 : -280 } : { width: isSidebarOpen ? 280 : 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} bg-[#1a1a1a] overflow-hidden`}
        >
          <Sidebar
            files={files}
            onFileSelect={handleFileSelect}
            selectedFileId={activeTabId}
            onClose={() => setIsSidebarOpen(false)}
            onOpenFolder={() => openFolder(fallbackInputRef)}
            isFileSystemSupported={isFileSystemSupported}
            onFileOperation={onFileOperation}
            onExport={() => exportAsZip(files)}
          />
        </motion.aside>

        <EditorView
          files={files}
          openTabIds={openTabIds}
          activeTabId={activeTabId}
          onTabSelect={setActiveTabId}
          onTabClose={closeTab}
          activeFile={activeFile}
          updateFileContent={updateFileContent}
          onKeyDown={handleEditorKeyDown}
          onInsertChar={insertChar}
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          searchResults={searchResults}
          searchIndex={searchIndex}
          onNextResult={nextResult}
          onPrevResult={prevResult}
          onReplace={handleReplace}
          onOpenFolder={() => openFolder(fallbackInputRef)}
        />
      </div>

      <StatusBar activeFile={activeFile} />

      <input
        type="file"
        ref={fallbackInputRef}
        onChange={handleOpenFolderFallback}
        style={{ display: 'none' }}
        // @ts-expect-error - webkitdirectory is a non-standard attribute
        webkitdirectory=""
        directory=""
      />

      <PreviewContainer 
        isOpen={previewState.isOpen} 
        html={previewState.html} 
        onClose={previewController.closePreview} 
      />
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { FileNode, FileOperationType } from '../types';
import { scanDirectory, saveFile as saveFileToDisk } from '../services/fileService';
import { findFileById, findParentNode, getLanguageFromExtension } from '../utils/fileUtils';

export const useFileSystem = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isFileSystemSupported] = useState(() => typeof window !== 'undefined' && 'showDirectoryPicker' in window);

  const openFolder = useCallback(async (fallbackInputRef: React.RefObject<HTMLInputElement>) => {
    if (!isFileSystemSupported) {
      fallbackInputRef.current?.click();
      return false;
    }
    try {
      // @ts-expect-error - showDirectoryPicker is a modern API
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      const rootNode = await scanDirectory(directoryHandle);
      setFiles([rootNode]);
      return true;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return false;
      console.error('Error opening directory:', err);
      if (confirm('File System Access API failed. Use fallback folder selection?')) {
        fallbackInputRef.current?.click();
      }
      return false;
    }
  }, [isFileSystemSupported]);

  const handleOpenFolderFallback = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    const root: FileNode = {
      id: 'root',
      name: inputFiles[0].webkitRelativePath.split('/')[0] || 'Project',
      type: 'folder',
      children: []
    };

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      const path = file.webkitRelativePath.split('/').slice(1);
      let current = root;

      for (let j = 0; j < path.length; j++) {
        const part = path[j];
        const isLast = j === path.length - 1;

        if (isLast) {
          const content = await file.text();
          current.children?.push({
            id: Math.random().toString(36).substr(2, 9),
            name: part,
            type: 'file',
            language: getLanguageFromExtension(part),
            content,
            isDirty: false
          });
        } else {
          let folder = current.children?.find(c => c.name === part && c.type === 'folder');
          if (!folder) {
            folder = {
              id: Math.random().toString(36).substr(2, 9),
              name: part,
              type: 'folder',
              children: []
            };
            current.children?.push(folder);
          }
          current = folder;
        }
      }
    }

    setFiles([root]);
  }, []);

  const updateFileContent = useCallback((id: string, newContent: string, isDirty = true) => {
    setFiles(prev => {
      const updateNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === id) {
            return { ...node, content: newContent, isDirty };
          }
          if (node.children) {
            return { ...node, children: updateNodes(node.children) };
          }
          return node;
        });
      };
      return updateNodes(prev);
    });
  }, []);

  const handleFileOperation = useCallback(async (type: FileOperationType, nodeId: string) => {
    const node = findFileById(files, nodeId);
    if (!node) return;

    try {
      if (type === 'delete') {
        if (!confirm(`Are you sure you want to delete ${node.name}?`)) return;
        if (node.handle) {
          const parent = findParentNode(files, nodeId);
          if (parent && parent.handle && parent.handle.kind === 'directory') {
            await (parent.handle as FileSystemDirectoryHandle).removeEntry(node.name, { recursive: true });
          }
        }
        setFiles(prev => {
          const removeNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter(n => n.id !== nodeId).map(n => ({
              ...n,
              children: n.children ? removeNode(n.children) : undefined
            }));
          };
          return removeNode(prev);
        });
      } else if (type === 'rename') {
        const newName = prompt('Enter new name:', node.name);
        if (!newName || newName === node.name) return;
        setFiles(prev => {
          const renameNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(n => {
              if (n.id === nodeId) return { ...n, name: newName };
              if (n.children) return { ...node, children: renameNode(n.children) };
              return n;
            });
          };
          return renameNode(prev);
        });
      } else if (type === 'create-file' || type === 'create-folder') {
        const name = prompt(`Enter ${type === 'create-file' ? 'file' : 'folder'} name:`);
        if (!name) return;

        const parentFolder = node.type === 'folder' ? node : findParentNode(files, nodeId);
        if (!parentFolder) return;

        let newHandle: FileSystemHandle | undefined;
        if (parentFolder.handle && parentFolder.handle.kind === 'directory') {
          const dirHandle = parentFolder.handle as FileSystemDirectoryHandle;
          if (type === 'create-file') {
            newHandle = await dirHandle.getFileHandle(name, { create: true });
          } else {
            newHandle = await dirHandle.getDirectoryHandle(name, { create: true });
          }
        }

        const newNode: FileNode = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          type: type === 'create-file' ? 'file' : 'folder',
          language: type === 'create-file' ? getLanguageFromExtension(name) : undefined,
          content: '',
          handle: newHandle,
          children: type === 'create-folder' ? [] : undefined
        };

        setFiles(prev => {
          const addNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(n => {
              if (n.id === parentFolder.id) return { ...n, children: [...(n.children || []), newNode] };
              if (n.children) return { ...n, children: addNode(n.children) };
              return n;
            });
          };
          return addNode(prev);
        });
        return newNode;
      }
    } catch (err) {
      console.error('File operation failed:', err);
      alert('Operation failed. Check permissions.');
    }
  }, [files]);

  const [isSaving, setIsSaving] = useState(false);

  const saveFile = useCallback(async (file: FileNode) => {
    setIsSaving(true);
    const success = await saveFileToDisk(file);
    if (success) {
      updateFileContent(file.id, file.content || '', false);
    }
    setTimeout(() => setIsSaving(false), 1000);
    return success;
  }, [updateFileContent]);

  const readFile = useCallback(async (file: FileNode) => {
    if (file.handle && !file.content) {
      try {
        const fileHandle = file.handle as FileSystemFileHandle;
        const fileData = await fileHandle.getFile();
        const content = await fileData.text();
        updateFileContent(file.id, content, false);
        return content;
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }
    return file.content;
  }, [updateFileContent]);

  return {
    files,
    setFiles,
    isFileSystemSupported,
    isSaving,
    openFolder,
    handleOpenFolderFallback,
    updateFileContent,
    handleFileOperation,
    saveFile,
    readFile
  };
};

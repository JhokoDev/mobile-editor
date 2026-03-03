import JSZip from 'jszip';
import { FileNode } from '../types';
import { getLanguageFromExtension } from '../utils/fileUtils';

export const scanDirectory = async (handle: FileSystemDirectoryHandle): Promise<FileNode> => {
  const node: FileNode = {
    id: Math.random().toString(36).substr(2, 9),
    name: handle.name,
    type: 'folder',
    handle,
    children: []
  };

  // @ts-expect-error - values() is part of the API
  for await (const entry of handle.values()) {
    if (entry.kind === 'directory') {
      node.children?.push(await scanDirectory(entry));
    } else {
      node.children?.push({
        id: Math.random().toString(36).substr(2, 9),
        name: entry.name,
        type: 'file',
        language: getLanguageFromExtension(entry.name),
        handle: entry,
        isDirty: false
      });
    }
  }
  return node;
};

export const exportAsZip = async (files: FileNode[]) => {
  if (files.length === 0) return;
  
  const zip = new JSZip();
  
  const addToZip = (nodes: FileNode[], path = '') => {
    nodes.forEach(node => {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      if (node.type === 'file') {
        zip.file(currentPath, node.content || '');
      } else if (node.children) {
        addToZip(node.children, currentPath);
      }
    });
  };

  addToZip(files);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${files[0]?.name || 'project'}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};

export const saveFile = async (file: FileNode): Promise<boolean> => {
  if (!file.handle) return false;
  try {
    const fileHandle = file.handle as FileSystemFileHandle;
    const writable = await fileHandle.createWritable();
    await writable.write(file.content || '');
    await writable.close();
    return true;
  } catch (err) {
    console.error('Error saving file:', err);
    return false;
  }
};

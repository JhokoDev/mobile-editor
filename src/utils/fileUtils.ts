import { FileNode } from '../types';

export const getLanguageFromExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    py: 'python',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    css: 'css',
    json: 'json',
    md: 'markdown',
    html: 'markup',
  };
  return map[extension] || 'plaintext';
};

export const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findParentNode = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.children?.some(child => child.id === id)) return node;
    if (node.children) {
      const found = findParentNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const extractDisplayPathFromSafUri = (safUri: string): string | null => {
  if (!safUri || typeof safUri !== 'string') return null;

  const marker = '/document/';
  const index = safUri.indexOf(marker);
  if (index === -1) return null;

  const encodedDocumentId = safUri.substring(index + marker.length);

  const queryIndex = encodedDocumentId.indexOf('?');
  const cleanEncoded =
    queryIndex !== -1
      ? encodedDocumentId.substring(0, queryIndex)
      : encodedDocumentId;

  let documentId: string;
  try {
    documentId = decodeURIComponent(cleanEncoded);
  } catch {
    return null;
  }

  const colonIndex = documentId.indexOf(':');
  if (colonIndex === -1) return null;

  const storageType = documentId.substring(0, colonIndex);
  const relativePath = documentId.substring(colonIndex + 1);

  if (storageType !== 'primary') return null;
  if (!relativePath) return null;

  return relativePath;
};

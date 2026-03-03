import { useState, useCallback } from 'react';
import { FileNode } from '../types';

export const useEditor = (activeFile: FileNode | null, updateFileContent: (id: string, content: string) => void) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<number[]>([]);

  const handleSearch = useCallback(() => {
    if (!activeFile || !searchQuery) {
      setSearchResults([]);
      return;
    }
    const content = activeFile.content || '';
    const results: number[] = [];
    let pos = content.indexOf(searchQuery);
    while (pos !== -1) {
      results.push(pos);
      pos = content.indexOf(searchQuery, pos + 1);
    }
    setSearchResults(results);
    setSearchIndex(0);
    
    if (results.length > 0) {
      const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(results[0], results[0] + searchQuery.length);
      }
    }
  }, [activeFile, searchQuery]);

  const nextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIdx = (searchIndex + 1) % searchResults.length;
    setSearchIndex(nextIdx);
    const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(searchResults[nextIdx], searchResults[nextIdx] + searchQuery.length);
    }
  }, [searchIndex, searchResults, searchQuery]);

  const prevResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIdx = (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(prevIdx);
    const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(searchResults[prevIdx], searchResults[prevIdx] + searchQuery.length);
    }
  }, [searchIndex, searchResults, searchQuery]);

  const handleReplace = useCallback((all = false) => {
    if (!activeFile || !searchQuery) return;
    const replaceWith = prompt('Replace with:');
    if (replaceWith === null) return;

    const content = activeFile.content || '';
    let newContent = '';
    if (all) {
      newContent = content.split(searchQuery).join(replaceWith);
    } else {
      if (searchResults.length === 0) return;
      const pos = searchResults[searchIndex];
      newContent = content.substring(0, pos) + replaceWith + content.substring(pos + searchQuery.length);
    }
    updateFileContent(activeFile.id, newContent);
    setTimeout(handleSearch, 0);
  }, [activeFile, searchQuery, searchResults, searchIndex, updateFileContent, handleSearch]);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeFile) return;
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    const char = e.key;
    if (pairs[char]) {
      e.preventDefault();
      const closingChar = pairs[char];
      const newValue = value.substring(0, selectionStart) + char + closingChar + value.substring(selectionEnd);
      updateFileContent(activeFile.id, newValue);
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const line = value.substring(0, selectionStart).split('\n').pop() || '';
      const indent = line.match(/^\s*/)?.[0] || '';
      const extraIndent = line.trim().endsWith('{') ? '  ' : '';
      const newValue = value.substring(0, selectionStart) + '\n' + indent + extraIndent + value.substring(selectionEnd);
      updateFileContent(activeFile.id, newValue);
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1 + indent.length + extraIndent.length, selectionStart + 1 + indent.length + extraIndent.length);
      }, 0);
    }
  }, [activeFile, updateFileContent]);

  const insertChar = useCallback((char: string) => {
    if (!activeFile) return;
    const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeFile.content || '';
    const newContent = content.substring(0, start) + char + content.substring(end);
    
    updateFileContent(activeFile.id, newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  }, [activeFile, updateFileContent]);

  return {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    searchIndex,
    searchResults,
    handleSearch,
    nextResult,
    prevResult,
    handleReplace,
    handleEditorKeyDown,
    insertChar
  };
};

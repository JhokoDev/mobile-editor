export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  handle?: FileSystemHandle;
  isDirty?: boolean;
}

export type FileOperationType = 'create-file' | 'create-folder' | 'rename' | 'delete';

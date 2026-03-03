export interface VirtualFileMap {
  [path: string]: string;
}

export interface PreviewState {
  isOpen: boolean;
  html: string;
  files?: VirtualFileMap;
}

export interface PreviewController {
  openPreview: (html: string, files?: VirtualFileMap) => void;
  closePreview: () => void;
  updatePreview: (html: string, files?: VirtualFileMap) => void;
}

export interface PreviewState {
  isOpen: boolean;
  html: string;
}

export interface PreviewController {
  openPreview: (html: string) => void;
  closePreview: () => void;
  updatePreview: (html: string) => void;
}

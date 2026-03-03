import React from 'react';

interface PreviewRendererProps {
  html: string;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ html }) => {
  return (
    <iframe
      srcDoc={html}
      title="HTML Preview"
      className="w-full h-full border-none bg-white"
      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation"
      referrerPolicy="no-referrer"
    />
  );
};

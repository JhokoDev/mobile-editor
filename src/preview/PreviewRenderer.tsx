import React, { useEffect, useRef } from 'react';

interface PreviewRendererProps {
  html: string;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="HTML Preview"
      className="w-full h-full border-none bg-white"
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
    />
  );
};

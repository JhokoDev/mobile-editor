
import React, { useEffect, useRef, useState } from 'react';

interface PreviewRuntimeProps {
  compiledHtml: string;
}

export interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  payload: unknown[];
  timestamp: number;
}

export const PreviewRuntime: React.FC<PreviewRuntimeProps> = ({ compiledHtml }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<ConsoleMessage[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In a real app, we should check event.origin, but here it's srcDoc so origin is "null"
      const { type, payload } = event.data;

      if (type?.startsWith('console-')) {
        const logType = type.split('-')[1] as ConsoleMessage['type'];
        setLogs(prev => [...prev, {
          type: logType,
          payload: Array.isArray(payload) ? payload : [payload],
          timestamp: Date.now()
        }]);
      } else if (type === 'error') {
        setLogs(prev => [...prev, {
          type: 'error',
          payload: [payload.message || payload],
          timestamp: Date.now()
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Clear logs when content changes
  const [prevHtml, setPrevHtml] = useState(compiledHtml);
  if (prevHtml !== compiledHtml) {
    setPrevHtml(compiledHtml);
    setLogs([]);
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      <div className="flex-1 relative">
        <iframe
          key={compiledHtml.length + compiledHtml.slice(0, 100)} // Simple key to force reload
          ref={iframeRef}
          title="Preview Sandbox"
          sandbox="allow-scripts"
          srcDoc={compiledHtml}
          className="w-full h-full border-none"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Optional: Minimal Console Overlay for debugging */}
      {logs.length > 0 && (
        <div className="h-32 border-t border-gray-200 bg-gray-50 overflow-y-auto font-mono text-xs p-2">
          <div className="flex justify-between items-center mb-1 sticky top-0 bg-gray-50 py-1 border-b border-gray-200">
            <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Console Output</span>
            <button 
              onClick={() => setLogs([])}
              className="text-[10px] text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 flex gap-2 ${
              log.type === 'error' ? 'text-red-600 bg-red-50' : 
              log.type === 'warn' ? 'text-amber-600 bg-amber-50' : 
              'text-gray-700'
            }`}>
              <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className="font-bold uppercase text-[9px] w-10 inline-block">{log.type}:</span>
              <span>{log.payload.join(' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

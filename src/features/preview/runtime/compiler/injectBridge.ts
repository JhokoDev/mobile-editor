
/**
 * Injects console and error bridge for monitoring.
 */
export const injectBridge = (html: string): string => {
  const bridgeScript = `
<script>
(function() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  const sendToParent = (type, payload) => {
    window.parent.postMessage({ type, payload }, "*");
  };

  console.log = (...args) => {
    sendToParent("console-log", args.map(String));
    originalLog(...args);
  };
  console.error = (...args) => {
    sendToParent("console-error", args.map(String));
    originalError(...args);
  };
  console.warn = (...args) => {
    sendToParent("console-warn", args.map(String));
    originalWarn(...args);
  };
  console.info = (...args) => {
    sendToParent("console-info", args.map(String));
    originalInfo(...args);
  };

  window.onerror = function(message, source, lineno, colno, error) {
    sendToParent("error", { 
      message: String(message), 
      lineno, 
      colno,
      stack: error ? error.stack : null
    });
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    sendToParent("error", { 
      message: "Unhandled Rejection: " + String(event.reason),
      stack: event.reason ? event.reason.stack : null
    });
  });
})();
</script>`;

  // Inject after security guards
  if (html.includes('</head>')) {
    return html.replace('</head>', bridgeScript + '</head>');
  }
  return html + bridgeScript;
};

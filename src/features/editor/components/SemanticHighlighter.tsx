
import React, { useMemo } from 'react';
import { tokenizeHTML } from '../tokenizer/htmlTokenizer';
import { tokenizeCSS } from '../tokenizer/cssTokenizer';
import { tokenizeJS } from '../tokenizer/jsTokenizer';

interface SemanticHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript' | 'js';
}

const TokenSpan: React.FC<{ type: string; value: string }> = ({ type, value }) => {
  const className = `token-${type}`;
  return <span className={className}>{value}</span>;
};

export const SemanticHighlighter: React.FC<SemanticHighlighterProps> = ({ code, language }) => {
  const tokens = useMemo(() => {
    if (language === 'html') {
      return tokenizeHTML(code);
    } else if (language === 'css') {
      return tokenizeCSS(code);
    } else if (language === 'javascript' || language === 'js') {
      return tokenizeJS(code);
    }
    return [{ type: 'text', value: code }];
  }, [code, language]);

  return (
    <code className="semantic-highlighter font-mono text-sm leading-[1.5] whitespace-pre">
      {tokens.map((token, i) => (
        <TokenSpan key={i} type={token.type} value={token.value} />
      ))}
    </code>
  );
};

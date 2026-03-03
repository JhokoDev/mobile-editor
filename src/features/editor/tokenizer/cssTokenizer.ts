
export type CSSTokenType = 
  | 'selector' 
  | 'property' 
  | 'value' 
  | 'unit' 
  | 'comment' 
  | 'at-rule'
  | 'punctuation';

export interface CSSToken {
  type: CSSTokenType;
  value: string;
}

export const tokenizeCSS = (code: string): CSSToken[] => {
  const tokens: CSSToken[] = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // Comments
    if (code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i + 2);
      if (end === -1) {
        tokens.push({ type: 'comment', value: code.slice(i) });
        break;
      }
      tokens.push({ type: 'comment', value: code.slice(i, end + 2) });
      i = end + 2;
      continue;
    }

    // At-rules
    if (char === '@') {
      const end = code.indexOf('{', i);
      if (end === -1) {
        tokens.push({ type: 'at-rule', value: code.slice(i) });
        break;
      }
      tokens.push({ type: 'at-rule', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Selectors and Declarations
    if (char === '{' || char === '}' || char === ':' || char === ';') {
      tokens.push({ type: 'punctuation', value: char });
      i++;
      continue;
    }

    // This is a very simplified CSS tokenizer
    // We'll use a state-based approach or regex for chunks
    const nextPunct = code.slice(i).search(/[{}:;]/);
    if (nextPunct === -1) {
      tokens.push({ type: 'selector', value: code.slice(i) });
      break;
    }

    const value = code.slice(i, i + nextPunct);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      // Heuristic: if it's before a ':', it's a property. If after, it's a value.
      // But we need context. Let's just tag them based on surrounding punctuation.
      const prevToken = tokens[tokens.length - 1];
      if (prevToken && prevToken.value === ':') {
        tokens.push({ type: 'value', value });
      } else if (prevToken && (prevToken.value === '{' || prevToken.value === ';')) {
        tokens.push({ type: 'property', value });
      } else {
        tokens.push({ type: 'selector', value });
      }
    } else {
      tokens.push({ type: 'punctuation', value });
    }

    i += nextPunct;
  }

  return tokens;
};


export type JSTokenType = 
  | 'keyword' 
  | 'function' 
  | 'variable' 
  | 'string' 
  | 'number' 
  | 'operator' 
  | 'comment' 
  | 'object-key'
  | 'punctuation'
  | 'text';

export interface JSToken {
  type: JSTokenType;
  value: string;
}

const keywords = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 
  'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 
  'finally', 'throw', 'class', 'extends', 'import', 'export', 'from', 
  'as', 'new', 'this', 'super', 'async', 'await', 'yield', 'typeof', 
  'instanceof', 'in', 'of', 'delete', 'void', 'true', 'false', 'null', 'undefined'
]);

export const tokenizeJS = (code: string): JSToken[] => {
  const tokens: JSToken[] = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // Comments
    if (code.startsWith('//', i)) {
      const end = code.indexOf('\n', i + 2);
      if (end === -1) {
        tokens.push({ type: 'comment', value: code.slice(i) });
        break;
      }
      tokens.push({ type: 'comment', value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

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

    // Strings
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let end = i + 1;
      while (end < code.length) {
        if (code[end] === quote && code[end - 1] !== '\\') {
          break;
        }
        end++;
      }
      tokens.push({ type: 'string', value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      const match = code.slice(i).match(/^[0-9]+(\.[0-9]+)?/);
      if (match) {
        tokens.push({ type: 'number', value: match[0] });
        i += match[0].length;
        continue;
      }
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_$]/.test(char)) {
      const match = code.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (match) {
        const value = match[0];
        if (keywords.has(value)) {
          tokens.push({ type: 'keyword', value });
        } else {
          // Heuristic for functions
          const nextChar = code[i + value.length];
          if (nextChar === '(') {
            tokens.push({ type: 'function', value });
          } else {
            tokens.push({ type: 'variable', value });
          }
        }
        i += value.length;
        continue;
      }
    }

    // Punctuation and Operators
    if (/[{}()[\]\],.;:]/.test(char)) {
      tokens.push({ type: 'punctuation', value: char });
      i++;
      continue;
    }

    if (/[+\-*/%=!&|^<>?]/.test(char)) {
      const match = code.slice(i).match(/^[+\-*/%=!&|^<>?]+/);
      if (match) {
        tokens.push({ type: 'operator', value: match[0] });
        i += match[0].length;
        continue;
      }
    }

    // Whitespace and other
    tokens.push({ type: 'text', value: char });
    i++;
  }

  return tokens;
};

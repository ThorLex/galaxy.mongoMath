import React from 'react';
import { Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="relative">
      <div className="absolute top-3 right-3">
        <button
          onClick={copyToClipboard}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-700/50"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <pre className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 overflow-x-auto">
        <code className="text-slate-300 text-sm">
          {code}
        </code>
      </pre>
    </div>
  );
}

export default CodeBlock;
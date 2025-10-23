import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Play, Save, Download } from 'lucide-react';

interface CodeEditorProps {
  assignmentTitle: string;
  instructions: string;
  language?: string;
  starterCode?: string;
  onSave?: (code: string) => void;
  onCodeChange?: (code: string) => void;
}

export default function CodeEditor({ 
  assignmentTitle, 
  instructions, 
  language = 'javascript',
  starterCode = '',
  onSave,
  onCodeChange
}: CodeEditorProps) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  // Update editor content when language or starter code changes
  useEffect(() => {
    setCode(starterCode);
    if (onCodeChange) {
      onCodeChange(starterCode);
    }
  }, [language, starterCode]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Running code...\n');
    
    // Simulate code execution (in a real app, you'd send to a backend)
    setTimeout(() => {
      setOutput(`Code execution completed!\n\nNote: In a full implementation, this would execute your ${language} code on a secure backend and return the actual results.`);
      setIsRunning(false);
    }, 1500);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code);
    }
    
    // Create downloadable file
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css'
    };
    
    const extension = extensions[language as keyof typeof extensions] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignmentTitle.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Code className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">{assignmentTitle}</h2>
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {language}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Instructions Panel */}
        <div className="w-1/3 border-r border-gray-200 p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Assignment Instructions</h3>
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-700 text-sm"
              dangerouslySetInnerHTML={{ 
                __html: instructions || '<p>No instructions provided.</p>' 
              }}
            />
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 border-b border-gray-200">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => {
                const val = value || '';
                setCode(val);
                if (onCodeChange) onCodeChange(val);
              }}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                formatOnType: true
              }}
              theme="vs-dark"
            />
          </div>

          {/* Output Panel */}
          <div className="h-32 bg-gray-900 text-green-400 p-4 overflow-y-auto">
            <div className="text-xs font-mono whitespace-pre-wrap">
              {output || 'Output will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
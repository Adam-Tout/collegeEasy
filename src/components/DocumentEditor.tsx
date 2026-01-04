import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FileText, Save, Download, Eye } from 'lucide-react';

interface DocumentEditorProps {
  assignmentTitle: string;
  instructions: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  externalContent?: string; // Allow external content updates
}

export interface DocumentEditorRef {
  setContent: (content: string) => void;
  getContent: () => string;
  appendContent: (content: string) => void;
}

const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(
  ({ assignmentTitle, instructions, onSave, onContentChange, externalContent }, ref) => {
    const [content, setContent] = useState('');
    const [isPreview, setIsPreview] = useState(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      setContent: (newContent: string) => {
        setContent(newContent);
        if (onContentChange) onContentChange(newContent);
      },
      getContent: () => content,
      appendContent: (newContent: string) => {
        const updated = content + (content ? '\n\n' : '') + newContent;
        setContent(updated);
        if (onContentChange) onContentChange(updated);
      }
    }));

    // Handle external content updates
    useEffect(() => {
      if (externalContent !== undefined && externalContent !== content) {
        setContent(externalContent);
        if (onContentChange) onContentChange(externalContent);
      }
    }, [externalContent]);

    const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
    // Create a downloadable file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignmentTitle.replace(/\s+/g, '_')}_essay.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

    const handlePreview = () => {
      setIsPreview(!isPreview);
    };

    return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">{assignmentTitle}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreview}
              className={`p-2 rounded-md ${isPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Toggle Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Save & Download
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

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          {isPreview ? (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-gray-900"
                  dangerouslySetInnerHTML={{ 
                    __html: content.replace(/\n/g, '<br />') || '<p>Start writing your essay...</p>' 
                  }}
                />
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => {
                const val = e.target.value;
                setContent(val);
                // Emit content to parent for AI context
                if (onContentChange) onContentChange(val);
              }}
              placeholder="Start writing your essay here..."
              className="flex-1 p-4 border-0 resize-none focus:outline-none focus:ring-0 text-gray-900"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Word count: {content.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
          <span>Character count: {content.length}</span>
        </div>
      </div>
    </div>
  );
});

DocumentEditor.displayName = 'DocumentEditor';

export default DocumentEditor;
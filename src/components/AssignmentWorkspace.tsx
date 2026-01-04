import { useEffect, useRef, useState } from 'react';
import { X, FileText, Code } from 'lucide-react';
import DocumentEditor, { DocumentEditorRef } from './DocumentEditor';
import CodeEditor, { CodeEditorRef } from './CodeEditor';
import WorkspaceChatInterface from './WorkspaceChatInterface';
import { CanvasAssignment, CanvasCourse } from '../types/canvas';
import { AssignmentInfo } from '../services/aiService';

interface AssignmentWorkspaceProps {
  assignment: CanvasAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  courses?: CanvasCourse[];
  asModal?: boolean;
}

export default function AssignmentWorkspace({ assignment, isOpen, onClose, courses = [], asModal = true }: AssignmentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'document' | 'code'>('document');
  const [workInProgress, setWorkInProgress] = useState<string>('');
  const documentEditorRef = useRef<DocumentEditorRef>(null);
  const codeEditorRef = useRef<CodeEditorRef>(null);

  if (!assignment || (asModal && !isOpen)) return null;

  // Heuristic to initialize coding project state; user can override with toggle
  const initialCodingHeuristic = (assignment.submission_types?.some(type => 
    ['online_text_entry', 'online_upload', 'online_url'].includes(type)
  ) && assignment.name.toLowerCase().includes('code')) || assignment.name.toLowerCase().includes('programming');
  const [isCodingProject, setIsCodingProject] = useState<boolean>(initialCodingHeuristic);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'cpp'>('javascript');

  const courseNameById = new Map<number, string>(courses.map(c => [c.id, c.name]));
  const courseName = courseNameById.get(assignment.course_id) || `Course ${assignment.course_id}`;

  const currentAssignmentInfo: AssignmentInfo = {
    name: assignment.name,
    course: courseName,
    description: assignment.description || 'No description provided.',
    dueDate: assignment.due_at || 'No due date',
    points: assignment.points_possible || 0,
    submissionStatus: assignment.has_submitted_submissions ? 'Submitted' : 'Not submitted'
  };

  const starterCodeByLang: Record<'javascript' | 'python' | 'cpp', string> = {
    javascript: `// Start coding here...\n\nfunction solve() {\n  // TODO: implement your solution\n}\n\nconsole.log('Ready to code!');`,
    python: `# Start coding here...\n\ndef solve():\n    # TODO: implement your solution\n    pass\n\nif __name__ == '__main__':\n    print('Ready to code!')`,
    cpp: `// Start coding here...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: implement your solution\n    cout << "Ready to code!" << endl;\n    return 0;\n}`
  };

  return (
    <div className={asModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' : 'min-h-screen bg-white'}>
      <div className={asModal ? 'bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col' : 'w-full h-screen flex flex-col'}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">{assignment.name}</h2>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {assignment.points_possible} points
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation + Coding Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('document')}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                activeTab === 'document'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Document Editor
            </button>
            {isCodingProject && (
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === 'code'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code className="h-4 w-4 mr-2" />
                Code Editor
              </button>
            )}
          </div>
          {/* Coding project toggle and language selector */}
          <div className="flex items-center gap-3 py-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isCodingProject}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setIsCodingProject(enabled);
                  if (enabled) setActiveTab('code');
                }}
              />
              Coding project
            </label>
            {isCodingProject && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'javascript' | 'python' | 'cpp')}
                className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white"
                aria-label="Select language"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
            )}
          </div>
        </div>

        {/* Content - resizable panes */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Editor with instructions */}
          <ResizablePane>
            {activeTab === 'document' ? (
              <DocumentEditor
                ref={documentEditorRef}
                assignmentTitle={assignment.name}
                instructions={assignment.description || 'No instructions provided.'}
                onSave={(content) => {
                  console.log('Document saved:', content);
                }}
                onContentChange={(content) => setWorkInProgress(content)}
              />
            ) : (
              <CodeEditor
                ref={codeEditorRef}
                assignmentTitle={assignment.name}
                instructions={assignment.description || 'No instructions provided.'}
                language={selectedLanguage}
                starterCode={starterCodeByLang[selectedLanguage]}
                onSave={(code) => {
                  console.log('Code saved:', code);
                }}
                onCodeChange={(code) => setWorkInProgress(code)}
              />
            )}
          </ResizablePane>

          {/* Right: Workspace AI Assistant - Specialized for writing and coding */}
          <div className="border-l border-gray-200 h-full flex-1 min-w-[260px]">
            <WorkspaceChatInterface
              assignment={currentAssignmentInfo}
              workInProgress={workInProgress}
              currentMode={activeTab}
              currentLanguage={selectedLanguage}
              storageKey={`workspace-chat-${assignment.id}`}
              onWriteDocument={(content) => {
                if (documentEditorRef.current) {
                  const existingContent = documentEditorRef.current.getContent();
                  if (existingContent && existingContent.trim().length > 0) {
                    // Append to existing content
                    documentEditorRef.current.appendContent(content);
                  } else {
                    // Replace if empty
                    documentEditorRef.current.setContent(content);
                  }
                }
              }}
              onWriteCode={async (content, language) => {
                // If not in code mode, switch first and wait
                if (activeTab !== 'code') {
                  if (!isCodingProject) {
                    setIsCodingProject(true);
                  }
                  setActiveTab('code');
                  if (language && language !== selectedLanguage) {
                    setSelectedLanguage(language as 'javascript' | 'python' | 'cpp');
                  }
                  // Wait for tab switch and editor to be ready
                  await new Promise(resolve => setTimeout(resolve, 1500));
                } else if (language && language !== selectedLanguage) {
                  setSelectedLanguage(language as 'javascript' | 'python' | 'cpp');
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                // Check existing content and append if there's already code
                if (codeEditorRef.current) {
                  const existingCode = codeEditorRef.current.getCode();
                  if (existingCode && existingCode.trim().length > 0 && !existingCode.includes('// Start coding here')) {
                    // Append to existing code
                    codeEditorRef.current.appendCode(content);
                  } else {
                    // Replace if empty or just starter code
                    codeEditorRef.current.setCode(content);
                  }
                  codeEditorRef.current.setLanguage(language);
                }
              }}
              onSwitchToDocument={() => {
                setActiveTab('document');
              }}
              onSwitchToCode={(language) => {
                if (!isCodingProject) {
                  setIsCodingProject(true);
                }
                setActiveTab('code');
                if (language) {
                  setSelectedLanguage(language as 'javascript' | 'python' | 'cpp');
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple horizontal resizable pane wrapper
function ResizablePane({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widthPct, setWidthPct] = useState<number>(50);
  const draggingRef = useRef<boolean>(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current?.parentElement) return;
      const parent = containerRef.current.parentElement;
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(80, Math.max(20, (x / rect.width) * 100));
      setWidthPct(pct);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full flex items-stretch" style={{ width: `${widthPct}%` }}>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize"
        onMouseDown={() => { draggingRef.current = true; }}
        className="w-1 cursor-col-resize bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
      />
    </div>
  );
}
import { useState } from 'react';
import { X, FileText, Code } from 'lucide-react';
import DocumentEditor from './DocumentEditor';
import CodeEditor from './CodeEditor';
import ChatInterface from './ChatInterface';
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

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Editor with instructions */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'document' ? (
              <DocumentEditor
                assignmentTitle={assignment.name}
                instructions={assignment.description || 'No instructions provided.'}
                onSave={(content) => {
                  console.log('Document saved:', content);
                }}
                onContentChange={(content) => setWorkInProgress(content)}
              />
            ) : (
              <CodeEditor
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
          </div>

          {/* Right: AI Assistant with assignment-aware context */}
          <div className="border-l border-gray-200 h-full">
            <ChatInterface 
              assignments={[currentAssignmentInfo]}
              courses={courses.map(c => ({ id: c.id, name: c.name, course_code: c.course_code }))}
              currentAssignment={currentAssignmentInfo}
              workInProgress={workInProgress}
              storageKey={`chatMessages-assignment-${assignment.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
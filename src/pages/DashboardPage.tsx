import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { CanvasService } from '../services/canvasService';
import { AIService, AssignmentInfo } from '../services/aiService';
import CalendarView from '../components/CalendarView';
import ChatInterface from '../components/ChatInterface';
import AssignmentWorkspace from '../components/AssignmentWorkspace';
import { CanvasAssignment, CanvasCourse } from '../types/canvas';
import { LogOut, BookOpen, Settings, User } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, auth, user, logout } = useAuthStore();
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<CanvasAssignment | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [aiAssignments, setAiAssignments] = useState<CanvasAssignment[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !auth) {
      navigate('/login');
      return;
    }

    loadAssignmentsAndCourses();
  }, [isAuthenticated, auth, navigate]);

  const loadAssignmentsAndCourses = async () => {
    if (!auth) return;

    try {
      setIsLoading(true);
      const canvasService = new CanvasService(auth.accessToken, auth.domain);
      // Load courses first so we can enrich assignment info with course names
      const courseList = await canvasService.getCourses();
      setCourses(courseList);
      // Then load assignments
      const allAssignments = await canvasService.getAllAssignments();
      const upcomingAssignments = canvasService.getUpcomingAssignments(allAssignments, 7);
      setAssignments(upcomingAssignments);
      const upcomingMonthAssignments = canvasService.getUpcomingAssignments(allAssignments, 30);
      setAiAssignments(upcomingMonthAssignments);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Error loading assignments/courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentClick = (assignment: CanvasAssignment) => {
    // Open assignment workspace in a new tab/fullscreen route using absolute URL
    const url = `${window.location.origin}/workspace/${assignment.course_id}/${assignment.id}`;
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAssignmentInfoForAI = (): AssignmentInfo[] => {
    const courseNameById = new Map<number, string>(courses.map(c => [c.id, c.name]));
    return aiAssignments.map(assignment => ({
      name: assignment.name,
      course: courseNameById.get(assignment.course_id) || `Course ${assignment.course_id}`,
      dueDate: assignment.due_at || 'No due date',
      description: assignment.description || 'No description available',
      points: assignment.points_possible || 0,
      submissionStatus: assignment.has_submitted_submissions ? 'Submitted' : 'Not submitted'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-5 w-5" />
              <span>{user?.name || 'Student'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200 text-sm"
            >
              <LogOut className="h-4 w-4 inline mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading assignments...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Left Side - Calendar */}
            <div className="h-full">
              <CalendarView 
                assignments={assignments} 
                onAssignmentClick={handleAssignmentClick}
              />
            </div>

            {/* Right Side - AI Chat */}
            <div className="h-full">
              <ChatInterface 
                assignments={getAssignmentInfoForAI()} 
                courses={courses.map(c => ({ id: c.id, name: c.name, course_code: c.course_code }))}
                // Use a dedicated storage key for dashboard chat to avoid conflicts with assignment workspace chat
                // @ts-ignore
                storageKey="chatMessages-dashboard"
              />
            </div>
          </div>
        )}
      </main>

      {/* Assignment Workspace Modal */}
      {/* Removed modal usage; workspace now opens in a dedicated full-screen route */}
    </div>
  );
}
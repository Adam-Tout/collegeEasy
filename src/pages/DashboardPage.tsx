import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { CanvasService } from '../services/canvasService';
import { AIService, AssignmentInfo } from '../services/aiService';
import CalendarView from '../components/CalendarView';
import ChatInterface from '../components/ChatInterface';
import { CanvasAssignment, CanvasCourse } from '../types/canvas';
import { demoCourses, getDemoAssignments } from '../data/demoData';
import { 
  LogOut, 
  BookOpen, 
  Settings, 
  User, 
  Bell, 
  Plus,
  CreditCard,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout: userLogout } = useUserStore();
  const { logout: canvasLogout } = useAuthStore();
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [aiAssignments, setAiAssignments] = useState<CanvasAssignment[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load Canvas data if user has active Canvas accounts
    const activeCanvasAccount = user.canvasAccounts?.find(acc => acc.isActive);
    if (activeCanvasAccount) {
      loadAssignmentsAndCourses(activeCanvasAccount);
    } else {
      // Load demo data if no active Canvas account
      loadDemoData();
    }
  }, [user, navigate]);

  const loadAssignmentsAndCourses = async (canvasAccount: any) => {
    try {
      setIsLoading(true);
      const canvasService = new CanvasService(canvasAccount.accessToken, canvasAccount.domain);
      
      // Load courses first
      const courseList = await canvasService.getCourses();
      setCourses(courseList);
      
      // Load assignments
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

  const loadDemoData = async () => {
    try {
      setIsLoading(true);
      
      // Load demo courses
      setCourses(demoCourses);
      
      // Load demo assignments
      const demoAssignments = getDemoAssignments();
      setAssignments(demoAssignments);
      setAiAssignments(demoAssignments);
    } catch (err) {
      setError('Failed to load demo data');
      console.error('Error loading demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentClick = (assignment: CanvasAssignment) => {
    // Open assignment workspace - the workspace page will handle demo authentication
    const url = `${window.location.origin}/workspace/${assignment.course_id}/${assignment.id}`;
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    userLogout();
    canvasLogout();
    navigate('/auth');
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

  const getSubscriptionBadge = () => {
    if (!user?.subscription) return null;
    
    const { plan, status } = user.subscription;
    const isActive = status === 'active' || status === 'trialing';
    
    return (
      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
        plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
        plan === 'premium' ? 'bg-blue-100 text-blue-800' :
        plan === 'basic' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        <Crown className="h-3 w-3" />
        <span className="capitalize">{plan}</span>
        {!isActive && <span className="text-red-600">({status})</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <header className="glass-effect border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Canvas AI Assistant</h1>
                  <p className="text-sm text-neutral-600">Your intelligent study companion</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {getSubscriptionBadge()}
              
              <div className="flex items-center space-x-2 text-neutral-600">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name}</span>
              </div>
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Upcoming Assignments</p>
                <p className="text-2xl font-bold text-primary-600">{assignments.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Active Courses</p>
                <p className="text-2xl font-bold text-secondary-600">{courses.length}</p>
              </div>
              <div className="bg-secondary-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">AI Queries</p>
                <p className="text-2xl font-bold text-accent-600">∞</p>
              </div>
              <div className="bg-accent-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Productivity</p>
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const total = aiAssignments.length;
                    if (!total) return '—';
                    const submitted = aiAssignments.filter(a => a.has_submitted_submissions).length;
                    const pct = Math.round((submitted / total) * 100);
                    return `+${pct}%`;
                  })()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 status-error p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Canvas Connection Status */}
        {!user?.canvasAccounts?.find(acc => acc.isActive) && (
          <div className="mb-6 card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Connect to Canvas</h3>
                  <p className="text-sm text-neutral-600">Link your Canvas account to get started</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Canvas Account
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-4 text-neutral-600 text-lg">Loading your dashboard...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Calendar */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">Assignment Calendar</h2>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <Calendar className="h-4 w-4" />
                  <span>7-day view</span>
                </div>
              </div>
              <CalendarView 
                assignments={assignments} 
                onAssignmentClick={handleAssignmentClick}
              />
            </div>

            {/* Right Side - AI Chat */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">AI Assistant</h2>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Smart help</span>
                </div>
              </div>
              <ChatInterface 
                assignments={getAssignmentInfoForAI()} 
                courses={courses.map(c => ({ id: c.id, name: c.name, course_code: c.course_code }))}
                storageKey="chatMessages-dashboard"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
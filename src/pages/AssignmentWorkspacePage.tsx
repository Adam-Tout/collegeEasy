import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentWorkspace from '../components/AssignmentWorkspace';
import { CanvasAssignment, CanvasCourse } from '../types/canvas';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { CanvasService } from '../services/canvasService';

export default function AssignmentWorkspacePage() {
  const navigate = useNavigate();
  const { isAuthenticated, auth } = useAuthStore();
  const { user } = useUserStore();
  const { courseId, assignmentId } = useParams();
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [assignment, setAssignment] = useState<CanvasAssignment | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDemoData = async () => {
      const service = new CanvasService('demo_token_12345', 'demo.instructure.com');
      const courseList = await service.getCourses();
      setCourses(courseList);
      try {
        const detail = await service.getAssignmentDetails(Number(courseId), Number(assignmentId));
        setAssignment(detail);
      } catch (err) {
        // If assignment not found in demo data, show error
        setError(`Demo assignment not found. Course ID: ${courseId}, Assignment ID: ${assignmentId}`);
        console.error('Demo assignment not found:', err);
      }
    };

    const loadData = async () => {
      if (!courseId || !assignmentId) {
        setError('Missing assignment identifiers');
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated (for app access)
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        setIsLoading(true);

        // Check if user has active Canvas account
        const activeCanvasAccount = user.canvasAccounts?.find(acc => acc.isActive);
        
        if (activeCanvasAccount && isAuthenticated && auth) {
          // Try using real Canvas credentials first
          try {
            const service = new CanvasService(auth.accessToken, auth.domain);
            const courseList = await service.getCourses();
            setCourses(courseList);
            const detail = await service.getAssignmentDetails(Number(courseId), Number(assignmentId));
            setAssignment(detail);
          } catch (realErr) {
            console.warn('[Workspace] Falling back to demo data due to error:', realErr);
            // Fallback to demo data if Canvas API blocked (CORS) or fails
            await loadDemoData();
          }
        } else {
          // No Canvas account or not authenticated - use demo data
          await loadDemoData();
        }
      } catch (err) {
        console.error('Failed to load assignment workspace:', err);
        setError('Failed to load assignment workspace');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, courseId, assignmentId, isAuthenticated, auth, user]);

  const handleClose = () => {
    try {
      window.close();
    } catch {
      navigate('/dashboard');
    }
  };

  // Allow access if user is authenticated (even without Canvas auth for demo mode)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading assignment workspace...</span>
        </div>
      ) : (
        <AssignmentWorkspace
          assignment={assignment}
          isOpen={true}
          onClose={handleClose}
          // @ts-ignore
          courses={courses}
          asModal={false}
        />
      )}
    </div>
  );
}
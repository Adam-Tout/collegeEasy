import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentWorkspace from '../components/AssignmentWorkspace';
import { CanvasAssignment, CanvasCourse } from '../types/canvas';
import { useAuthStore } from '../stores/authStore';
import { CanvasService } from '../services/canvasService';

export default function AssignmentWorkspacePage() {
  const navigate = useNavigate();
  const { isAuthenticated, auth } = useAuthStore();
  const { courseId, assignmentId } = useParams();
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [assignment, setAssignment] = useState<CanvasAssignment | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !assignmentId) {
        setError('Missing assignment identifiers');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if we need to set up demo authentication
        if (!isAuthenticated || !auth) {
          // Try to set up demo authentication
          try {
            await useAuthStore.getState().login('demo.instructure.com', 'demo_token_12345');
            useAuthStore.getState().setUser({
              id: 1,
              name: 'Demo User',
              sortable_name: 'Demo User',
              short_name: 'Demo',
              email: 'demo@example.com',
              login_id: 'demo@example.com',
              avatar_url: '',
              primary_email: 'demo@example.com'
            });
          } catch (error) {
            console.error('Failed to set up demo authentication:', error);
            navigate('/auth');
            return;
          }
        }

        const service = new CanvasService('demo_token_12345', 'demo.instructure.com');
        const courseList = await service.getCourses();
        setCourses(courseList);

        // Load demo assignment
        const all = await service.getAllAssignments();
        const assign = all.find(a => a.id === Number(assignmentId) && a.course_id === Number(courseId)) || null;
        setAssignment(assign);
      } catch (err) {
        console.error('Failed to load assignment workspace:', err);
        setError('Failed to load assignment workspace');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate, courseId, assignmentId]);

  const handleClose = () => {
    try {
      window.close();
    } catch {
      navigate('/dashboard');
    }
  };

  if (!isAuthenticated) return null;

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
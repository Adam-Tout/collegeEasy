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
    if (!isAuthenticated || !auth) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      if (!auth || !courseId || !assignmentId) {
        setError('Missing assignment identifiers');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const service = new CanvasService(auth.accessToken, auth.domain);
        const courseList = await service.getCourses();
        setCourses(courseList);

        const isDemo = auth.accessToken === 'demo_token_12345' && auth.domain === 'demo.instructure.com';
        let assign: CanvasAssignment | null = null;
        if (isDemo) {
          const all = await service.getAllAssignments();
          assign = all.find(a => a.id === Number(assignmentId) && a.course_id === Number(courseId)) || null;
        } else {
          assign = await service.getAssignmentDetails(Number(courseId), Number(assignmentId));
        }
        setAssignment(assign);
      } catch (err) {
        console.error('Failed to load assignment workspace:', err);
        setError('Failed to load assignment workspace');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, auth, navigate, courseId, assignmentId]);

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